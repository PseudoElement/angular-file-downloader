import { Injectable } from '@angular/core';
import { SeaBattleApiService } from './sea-battle-api.service';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomInfoResp } from '../models/sea-battle-api-types';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { SocketReqMsg } from '../models/sea-battle-socket-req-types';
import {
    ConnectPlayerRespMsg,
    DisconnectPlayerRespMsg,
    PlayerReadyRespMsg,
    PlayerStepRespMsg,
    SocketRespMsg
} from '../models/sea-battle-socket-resp-types';
import { HttpErrorResponse } from '@angular/common/http';
import { ROOM_STATUS, RoomStatus, SOCKET_RESP_TYPE, STEP_RESULT } from '../constants/socket-constants';
import { SeaBattleStateService } from './sea-battle-state.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { getYouAndEnemyFromResp, isYou, whoStepsFirst } from '../utils/get-you-and-enemy';
import { SeabattleRoom } from '../entities/room';
import { CLEAR_SEABATTLE_FIELD, DELAY_BEFORE_STEP } from '../constants/seabattle-consts';
import { handleNextStepOrder } from '../utils/handle-next-step-order';
import { SeaBattleFieldService } from './sea-battle-field.service';

@Injectable()
export class SeaBattleSocketService {
    private get rooms(): SeabattleRoom[] {
        return this.sbStateSrv.rooms;
    }

    constructor(
        private readonly sbApiSrv: SeaBattleApiService,
        private readonly alertsSrv: AlertsService,
        private readonly sbStateSrv: SeaBattleStateService,
        private readonly sbFieldSrv: SeaBattleFieldService,
        private readonly authSrv: AuthService,
        private readonly router: Router
    ) {}

    public async createAndConnectToNewRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const roomInfo = await this.sbApiSrv.createRoom(params);
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
     * @param roomInfo may be loaded from sbApiSrv.createRoom and passed here.
     */
    public async connectToRoom(params: ConnectRoomReqBody, roomInfo?: RoomInfoResp): Promise<void> {
        try {
            if (!roomInfo) {
                roomInfo = await this.sbApiSrv.fetchRoomInfo(params);
            }
            const socket = this.sbApiSrv.connectToRoom(params);

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
        const room = this.sbStateSrv.getRoomById(roomId);
        room?.socket.send(JSON.stringify(msg));
    }

    public async sendUpdatedPositions(roomId: string, myPositions: string): Promise<void> {
        this.sendMessage(roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS,
            data: {
                player_positions: myPositions
            }
        });
        const room = this.sbStateSrv.getRoomById(roomId);
        room.updatePlayerInRoom(this.authSrv.user!.email, { positions: myPositions });
    }

    public async disconnectFromRoom(roomId: string, playerEmail: string): Promise<void> {
        try {
            const room = this.sbStateSrv.getRoomById(roomId);

            await this.sbApiSrv.disconnectFromRoom({ player_email: playerEmail, room_id: room.data.roomId });

            room?.socket.removeEventListener('message', (e) => this.listenSocketMessage(room.socket, room.data.roomId, JSON.parse(e.data)));
            room?.socket.removeEventListener('error', () => this.listenSocketError(room!.data.roomName));
            room?.socket.removeEventListener('open', () => this.listenSocketOpen(room!.data.roomId, room!.data.roomName));
            room?.socket.close();

            this.sbStateSrv.leaveRoom(roomId);
            this.alertsSrv.showAlert({ text: `You disconnected from room ${room?.data.roomName}`, type: 'success' });
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
            case SOCKET_RESP_TYPE.START_GAME:
                this.handleStartGame(roomId);
                break;
            default:
                throw new Error(`Invalid SOCKET_RESP_TYPE ==> ${msg.action_type}`);
        }

        const room = this.sbStateSrv.getRoomById(roomId);
        room.data.messages = [...room!.data.messages, msg];
        this.sbStateSrv.updateRooms(this.rooms);

        const chatEl = document.querySelector('.messages');
        chatEl?.scrollBy({ behavior: 'smooth', left: 0, top: 500 });
    }

    private handleStartGame(roomId: string): void {
        const room = this.sbStateSrv.getRoomById(roomId);
        const firstStepPlayer = whoStepsFirst(room);
        const isYouStarting = isYou(firstStepPlayer.playerEmail, this.authSrv);
        const roomStatus: RoomStatus = isYouStarting ? ROOM_STATUS.READY_YOUR_NEXT_STEP : ROOM_STATUS.READY_ENEMY_NEXT_STEP;

        room.updateData({ steppingPlayer: firstStepPlayer, isPlaying: true, status: roomStatus });
    }

    private handleConnectionMsg(socket: WebSocket, roomId: string, msg: ConnectPlayerRespMsg): void {
        const playersOfRoom = getYouAndEnemyFromResp(msg, this.authSrv);

        // you connected
        if (msg.data.stepping_player_email === this.authSrv.user?.email) {
            const newRoom = new SeabattleRoom(
                socket,
                {
                    roomId,
                    createdAt: msg.data.created_at,
                    roomName: msg.data.room_name,
                    playersOfRoom
                },
                this.authSrv
            );

            this.sbStateSrv.updateRooms([...this.rooms, newRoom]);
        } //enemy connected
        else {
            const room = this.sbStateSrv.getRoomById(roomId);
            room.updatePlayerInRoom(playersOfRoom.enemy_data.player_email, {
                isReady: false,
                hasFall: false,
                isOwner: playersOfRoom.enemy_data.is_owner,
                playerEmail: playersOfRoom.enemy_data.player_email,
                playerId: playersOfRoom.enemy_data.player_id,
                positions: CLEAR_SEABATTLE_FIELD
            });
        }
    }

    private handleDisconnectionMsg(roomId: string, msg: DisconnectPlayerRespMsg): void {
        const room = this.sbStateSrv.getRoomById(roomId);
        if (msg.data.player_email !== this.authSrv.user?.email) {
            room.removeEnemyFromRoom();
            room.updatePlayerInRoom(this.authSrv.user!.email, {
                hasFall: false,
                isOwner: true,
                isReady: false,
                positions: CLEAR_SEABATTLE_FIELD
            });
            room.updateData({ isPlaying: false, status: ROOM_STATUS.IDLE });
        } else {
            this.sbStateSrv.leaveRoom(roomId);
        }
    }

    private handleReadyMsg(roomId: string, msg: PlayerReadyRespMsg): void {
        const room = this.sbStateSrv.getRoomById(roomId);
        room.updatePlayerInRoom(msg.data.player_email, { isReady: true });

        if (room.data.players.enemy?.isReady && room.data.players.me.isReady) {
            room.updateData({ status: ROOM_STATUS.READY_TO_START });
        }
    }

    private handleStep(roomId: string, msg: PlayerStepRespMsg): void {
        const room = this.sbStateSrv.getRoomById(roomId);

        const affectedPositions = isYou(msg.data.player_email, this.authSrv)
            ? room.data.players.enemy!.positions
            : room.data.players.me.positions;

        const affectedPlayer = isYou(msg.data.player_email, this.authSrv) ? room.data.players.enemy! : room.data.players.me;
        const steppingPlayer = isYou(msg.data.player_email, this.authSrv) ? room.data.players.me : room.data.players.enemy!;

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
            case STEP_RESULT.EMPTY_STEP:
            case STEP_RESULT.ALREADY_CHECKED:
                newPositions = affectedPositions;
                hasFall = true;
                break;
            case STEP_RESULT.MISS:
                const missedCell = `${cellValueWithoutComma}.`;
                newPositions = affectedPlayer.positions.replace(cellValueWithoutComma, missedCell);
                break;
            default:
                throw new Error(`Invalid STEP_RESULT ${msg.data.step_result}!`);
        }

        room.updatePlayerInRoom(affectedPlayer.playerEmail, { positions: newPositions, hasFall });
        handleNextStepOrder(room, msg, this.authSrv, this.sbStateSrv);
    }

    private handleWin(roomId: string): void {
        const room = this.sbStateSrv.getRoomById(roomId);

        room.updateData({ status: ROOM_STATUS.END, steppingPlayer: null });
        this.sbFieldSrv.updateEnemyPositions(CLEAR_SEABATTLE_FIELD);
        this.sbFieldSrv.updateYourPositions(CLEAR_SEABATTLE_FIELD);

        setTimeout(() => {
            room.updateData({ status: ROOM_STATUS.IDLE, steppingPlayer: null });
        }, DELAY_BEFORE_STEP);
    }
}
