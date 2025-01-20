import { Injectable } from '@angular/core';
import { SeaBattleApiService } from './sea-battle-api.service';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomInfoResp, RoomPlayer, RoomSocket } from '../models/sea-battle-api-types';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { SocketReqMsg } from '../models/sea-battle-socket-req-types';
import {
    ConnectPlayerRespMsg,
    DisconnectPlayerRespMsg,
    PlayerReadyRespMsg,
    PlayerSetPositionsRespMsg,
    PlayerStepRespMsg,
    SocketRespMsg
} from '../models/sea-battle-socket-resp-types';
import { HttpErrorResponse } from '@angular/common/http';
import { ROOM_STATE, SOCKET_RESP_TYPE, STEP_RESULT } from '../constants/socket-constants';
import { SeaBattleStateService } from './sea-battle-state.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CLEAR_SEABATTLE_FIELD } from '../constants/seabattle-consts';
import { getYouAndEnemyFromResp } from '../utils/get-you-and-enemy';

@Injectable()
export class SeaBattleSocketService {
    private get rooms(): RoomSocket[] {
        return this.seabattleState.rooms;
    }

    constructor(
        private readonly seabattleApiSrv: SeaBattleApiService,
        private readonly alertsSrv: AlertsService,
        private readonly seabattleState: SeaBattleStateService,
        private readonly authSrv: AuthService,
        private readonly router: Router
    ) {}

    public async createAndConnectToNewRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const roomInfo = await this.seabattleApiSrv.createRoom(params);
            this.alertsSrv.showAlert({ text: `Room "${roomInfo.room_name}" created successfully!`, type: 'success' });
            await this.connectToRoom({ ...params, room_id: roomInfo.room_id }, roomInfo);
        } catch (err) {
            console.log('createAndConnectToNewRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    /**
     *
     * @param params {ConnectRoomReqBody}
     * @param roomInfo may be loaded from seabattleApiSrv.createRoom and passed here.
     */
    public async connectToRoom(params: ConnectRoomReqBody, roomInfo?: RoomInfoResp): Promise<void> {
        try {
            if (!roomInfo) {
                roomInfo = await this.seabattleApiSrv.fetchRoomInfo(params);
            }
            const socket = this.seabattleApiSrv.connectToRoom(params);

            socket.onerror = function (err) {
                console.log('SOCKET_ERROR', err);
            };

            socket.addEventListener('message', (e) => this.listenSocketMessage(socket, roomInfo!.room_id, JSON.parse(e.data)));
            socket.addEventListener('error', () => this.listenSocketError(roomInfo!.room_id));
            socket.addEventListener('open', () => this.listenSocketOpen(roomInfo!.room_id, roomInfo!.room_name));
        } catch (err) {
            console.log('connectToRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public sendMessage(roomId: string, msg: SocketReqMsg): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId);
        room?.socket.send(JSON.stringify(msg));
    }

    public async disconnectFromRoom(roomId: string, playerEmail: string): Promise<void> {
        try {
            const room = this.rooms.find((r) => r.data.room_id === roomId)!;
            const filteredRooms = this.rooms.filter((r) => room.data.room_id !== roomId);

            await this.seabattleApiSrv.disconnectFromRoom({ player_email: playerEmail, room_id: room.data.room_id });

            room?.socket.removeEventListener('message', (e) =>
                this.listenSocketMessage(room.socket, room.data.room_id, JSON.parse(e.data))
            );
            room?.socket.removeEventListener('error', () => this.listenSocketError(room!.data.room_name));
            room?.socket.removeEventListener('open', () => this.listenSocketOpen(room!.data.room_id, room!.data.room_name));
            room?.socket.close();

            this.seabattleState.updateRooms(filteredRooms);
            this.alertsSrv.showAlert({ text: `You disconnected from room ${room?.data.room_name}`, type: 'success' });
        } catch (err) {
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    private listenSocketError(roomName: string): void {
        this.alertsSrv.showAlert({ text: `Error occured trying to connect to room ${roomName}`, type: 'error' });
    }

    private listenSocketOpen(roomId: string, roomName: string): void {
        setTimeout(() => {
            this.router.navigate(['mini-games', 'sea-battle', 'room', roomId]);
            this.alertsSrv.showAlert({ text: `You've connected to room "${roomName}"!`, type: 'success' });
        }, 50);
    }

    private listenSocketMessage(socket: WebSocket, roomId: string, msg: SocketRespMsg): void {
        console.log('msg.SOCKET ====> ', msg);
        switch (msg.action_type) {
            case SOCKET_RESP_TYPE.CONNECT_PLAYER:
                this.handleConnectionMsg(socket, roomId, msg as ConnectPlayerRespMsg);
                break;
            case SOCKET_RESP_TYPE.DISCONNECT_PLAYER:
                this.handleDisconnectionMsg(roomId, msg as DisconnectPlayerRespMsg);
                break;
            case SOCKET_RESP_TYPE.READY:
                this.handleReadyMsg(roomId, msg as PlayerReadyRespMsg);
                break;
            case SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS:
                break;
            case SOCKET_RESP_TYPE.STEP:
                this.handleStep(roomId, msg as PlayerStepRespMsg);
                break;
            case SOCKET_RESP_TYPE.WIN_GAME:
                this.handleWin(roomId);
                break;
            default:
                throw new Error(`Invalid SOCKET_RESP_TYPE ==> ${msg.action_type}`);
        }

        const room = this.rooms.find((r) => r.data.room_id === roomId);
        room!.data.messages = [...room!.data.messages, msg];
        this.seabattleState.updateRooms(this.rooms);
    }

    private handleConnectionMsg(socket: WebSocket, roomId: string, msg: ConnectPlayerRespMsg): void {
        const playersOfRoom = getYouAndEnemyFromResp(msg, this.authSrv.user!.email);
        console.log('playersOfRoom', playersOfRoom);
        const me = {
            isOwner: playersOfRoom.your_data.is_owner,
            playerEmail: playersOfRoom.your_data.player_email,
            playerId: playersOfRoom.your_data.player_id,
            positions: CLEAR_SEABATTLE_FIELD,
            isReady: false,
            hasFall: false
        } satisfies RoomPlayer;
        const enemy = {
            isOwner: playersOfRoom.enemy_data.is_owner,
            playerEmail: playersOfRoom.enemy_data.player_email,
            playerId: playersOfRoom.enemy_data.player_id,
            positions: CLEAR_SEABATTLE_FIELD,
            isReady: false,
            hasFall: false
        } satisfies RoomPlayer;

        const newRoomSocket = {
            socket,
            state: ROOM_STATE.IDLE,
            data: {
                messages: [] as SocketRespMsg[],
                room_name: msg.data.room_name,
                room_id: msg.data.room_id,
                created_at: msg.data.created_at,
                players: { me, enemy }
            }
        } satisfies RoomSocket;

        if (msg.data.stepping_player_email === this.authSrv.user?.email) {
            this.seabattleState.updateRooms([...this.rooms, newRoomSocket]);
        } //enemy connected
        else {
            this.seabattleState.updateRoomState(roomId, playersOfRoom.enemy_data.player_email, {
                isReady: false,
                hasFall: false,
                isOwner: playersOfRoom.enemy_data.is_owner,
                playerEmail: playersOfRoom.enemy_data.player_email,
                playerId: playersOfRoom.enemy_data.player_id,
                positions: ''
            });
        }
    }

    private handleDisconnectionMsg(roomId: string, msg: DisconnectPlayerRespMsg): void {
        // is you disconected
        if (msg.data.player_email === this.authSrv.user?.email) {
            const filtered = this.rooms.filter((r) => r.data.room_id !== roomId);
            this.seabattleState.updateRooms(filtered);
        } else {
            this.seabattleState.removeEnemyFromRoom(roomId);
            this.seabattleState.makePlayerAsOwner(roomId, this.authSrv.user!.email);
        }
    }

    private handleReadyMsg(roomId: string, msg: PlayerReadyRespMsg): void {
        this.seabattleState.updateRoomState(roomId, msg.data.player_email, { isReady: true });
    }

    private handleStep(roomId: string, msg: PlayerStepRespMsg): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        /**
         * if My step -> need update enemy.positions
         * if not my step -> need update me.posiitons
         */

        const isYourStep = msg.data.player_email === this.authSrv.user?.email;
        const affectedPositions = isYourStep ? room.data.players.enemy!.positions : room.data.players.me.positions;
        const affectedPlayer = isYourStep ? room.data.players.enemy! : room.data.players.me;
        const steppingPlayer = isYourStep ? room.data.players.me : room.data.players.enemy!;

        const regex = new RegExp(`${msg.data.step}[^,]*,`);
        const cellValue = regex.exec(affectedPositions)![0];
        const cellValueWithoutComma = cellValue.slice(0, cellValue.length - 1);

        let newPositions = '';
        let hasFall = false;
        switch (msg.data.step_result) {
            case STEP_RESULT.HIT:
                const hitCell = `${cellValueWithoutComma}*`;
                newPositions = affectedPositions.replace(cellValueWithoutComma, hitCell);
                break;
            case STEP_RESULT.KILL:
                const killedCell = `${cellValueWithoutComma}*`;
                newPositions = affectedPositions.replace(cellValueWithoutComma, killedCell);
                break;
            case STEP_RESULT.ALREADY_CHECKED:
                newPositions = affectedPositions;
                hasFall = true;
                if (steppingPlayer.playerEmail === this.authSrv.user?.email) {
                    this.alertsSrv.showAlert({ text: `You've already checked ${msg.data.step} cell. Try another.`, type: 'warn' });
                }
                break;
            case STEP_RESULT.MISS:
                const missedCell = `${cellValueWithoutComma}.`;
                newPositions = affectedPlayer.positions.replace(cellValueWithoutComma, missedCell);
                break;
            default:
                throw new Error(`Invalid STEP_RESULT ${msg.data.step_result}!`);
        }

        this.seabattleState.updateRoomState(room.data.room_id, affectedPlayer.playerEmail, { positions: newPositions, hasFall });
    }

    private handleWin(roomId: string): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        room.state = ROOM_STATE.END;
    }
}
