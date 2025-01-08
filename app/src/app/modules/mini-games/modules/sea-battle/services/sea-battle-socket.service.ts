import { Injectable } from '@angular/core';
import { SeaBattleApiService } from './sea-battle-api.service';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomInfoResp, RoomPlayer, RoomSocket } from '../models/sea-battle-api-types';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { SocketReqMsg } from '../models/sea-battle-socket-req-types';
import {
    ConnectPlayerRespMsg,
    DisconnectPlayerRespMsg,
    PlayerSetPositionsRespMsg,
    PlayerStepRespMsg,
    SocketRespMsg
} from '../models/sea-battle-socket-resp-types';
import { HttpErrorResponse } from '@angular/common/http';
import { ROOM_STATE, SOCKET_RESP_TYPE, STEP_RESULT } from '../constants/socket-constants';
import { SeaBattleStateService } from './sea-battle-state.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

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
            this.router.navigate(['mini-games', 'sea-battle']);
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
            case SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS:
                this.handlePlayerSetPositions(roomId, msg as PlayerSetPositionsRespMsg);
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
        room?.data.messages.push(msg);
        this.seabattleState.updateRooms(this.rooms);
    }

    private handleConnectionMsg(socket: WebSocket, _roomId: string, msg: ConnectPlayerRespMsg): void {
        const me = {
            isOwner: msg.data.your_data.is_owner,
            playerEmail: msg.data.your_data.player_email,
            playerId: msg.data.your_data.player_id,
            positions: '',
            isReady: false
        } satisfies RoomPlayer;
        const enemy = {
            isOwner: msg.data.enemy_data.is_owner,
            playerEmail: msg.data.enemy_data.player_email,
            playerId: msg.data.enemy_data.player_id,
            positions: '',
            isReady: false
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

        this.seabattleState.updateRooms([...this.rooms, newRoomSocket]);
    }

    private handleDisconnectionMsg(roomId: string, _msg: DisconnectPlayerRespMsg): void {
        const filtered = this.rooms.filter((r) => r.data.room_id !== roomId);
        this.seabattleState.updateRooms([...filtered]);
    }

    private handlePlayerSetPositions(roomId: string, msg: PlayerSetPositionsRespMsg): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        const isYou = msg.data.player_email === this.authSrv.user?.email;

        if (isYou) {
            room.data.players.me.isReady = true;
        } else {
            room.data.players.enemy!.isReady = true;
        }
    }

    private handleStep(roomId: string, msg: PlayerStepRespMsg): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        const steppingPlayer = msg.data.player_email === this.authSrv.user?.email ? room.data.players.me : room.data.players.enemy!;

        const regex = new RegExp(`${msg.data.step}[^,]*,`);
        const cellValue = regex.exec(steppingPlayer.positions)![0];
        const cellValueWithoutComma = cellValue.slice(0, cellValue.length - 1);

        switch (msg.data.step_result) {
            case STEP_RESULT.HIT:
                const hitCell = `${cellValueWithoutComma}*`;
                steppingPlayer.positions = steppingPlayer.positions.replace(cellValueWithoutComma, hitCell);
                return;
            case STEP_RESULT.KILL:
                const killedCell = `${cellValueWithoutComma}*`;
                steppingPlayer.positions = steppingPlayer.positions.replace(cellValueWithoutComma, killedCell);
                break;
            case STEP_RESULT.ALREADY_CHECKED:
                this.alertsSrv.showAlert({ text: `You've already checked ${msg.data.step} cell. Try another.`, type: 'warn' });
                break;
            case STEP_RESULT.MISS:
                const missedCell = `${cellValueWithoutComma}.`;
                steppingPlayer.positions = steppingPlayer.positions.replace(cellValueWithoutComma, missedCell);
                break;
            default:
                throw new Error(`Invalid STEP_RESULT ${msg.data.step_result}!`);
        }
    }

    private handleWin(roomId: string): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        room.state = ROOM_STATE.END;
    }
}
