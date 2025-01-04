import { Injectable } from '@angular/core';
import { SeaBattleApiService } from './sea-battle-api.service';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomPlayer, RoomSocket } from '../models/sea-battle-api-types';
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

@Injectable()
export class SeaBattleSocketService {
    private get rooms(): RoomSocket[] {
        return this.seabattleState.rooms;
    }

    constructor(
        private readonly seabattleApiSrv: SeaBattleApiService,
        private readonly alertsSrv: AlertsService,
        private readonly seabattleState: SeaBattleStateService
    ) {}

    public async createAndConnectToNewRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const resp = await this.seabattleApiSrv.createRoom(params);
            this.alertsSrv.showAlert({ text: `Room "${resp.room_name}" created successfully!`, type: 'success' });
            await this.connectToRoom({ ...params, room_id: resp.room_id });
        } catch (err) {
            console.log('createAndConnectToNewRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public async connectToRoom(params: ConnectRoomReqBody): Promise<void> {
        try {
            const socket = this.seabattleApiSrv.connectToRoom(params);
            const roomInfo = await this.seabattleApiSrv.fetchRoomInfo(params);

            socket.addEventListener('message', (e) => this.listenSocketMessage(socket, roomInfo.room_id, e.data));
            socket.addEventListener('error', () => this.listenSocketError(roomInfo.room_id));
            socket.addEventListener('open', () => this.listenSocketOpen(roomInfo.room_id));

            this.alertsSrv.showAlert({ text: `You've connected to room "${roomInfo.room_name}"!`, type: 'success' });
        } catch (err) {
            console.log('connectToRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public sendMessage(socketId: string, msg: SocketReqMsg): void {
        const room = this.rooms.find((r) => r.id === socketId);
        room?.socket.send(JSON.stringify(msg));
    }

    public async disconnectFromRoom(socketId: string, playerEmail: string): Promise<void> {
        try {
            const room = this.rooms.find((r) => r.id === socketId)!;
            const filteredRooms = this.rooms.filter((r) => r.id !== socketId);

            await this.seabattleApiSrv.disconnectFromRoom({ player_email: playerEmail, room_name: room.data.room_name });

            room?.socket.removeEventListener('message', (e) => this.listenSocketMessage(room.socket, room.id, e.data));
            room?.socket.removeEventListener('error', () => this.listenSocketError(room.id));
            room?.socket.removeEventListener('open', () => this.listenSocketOpen(room.id));

            room?.socket.close();
            this.seabattleState.updateRooms(filteredRooms);
            this.alertsSrv.showAlert({ text: `You disconnected from room ${room?.data.room_name}`, type: 'success' });
        } catch (err) {
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    private listenSocketError(socketId: string): void {
        const room = this.rooms.find((r) => r.id === socketId);
        this.alertsSrv.showAlert({ text: `Error occured trying to connect to room ${room?.data.room_name}`, type: 'error' });
    }

    private listenSocketOpen(socketId: string): void {
        const room = this.rooms.find((r) => r.id === socketId);
        this.alertsSrv.showAlert({ text: `You connected to room ${room?.data.room_name}!`, type: 'success' });
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
                throw new Error(`Invalid SOCKET_RESP_TYPE ==> ${SOCKET_RESP_TYPE}`);
        }

        const room = this.rooms.find((r) => r.id === roomId);
        room?.data.messages.push(msg);
        this.seabattleState.updateRooms(this.rooms);
    }

    private handleConnectionMsg(socket: WebSocket, roomId: string, msg: ConnectPlayerRespMsg): void {
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
            id: roomId,
            socket,
            state: ROOM_STATE.IDLE,
            data: {
                messages: [] as SocketRespMsg[],
                room_name: msg.data.room_name,
                room_id: msg.data.room_id,
                players: [me, enemy]
            }
        } satisfies RoomSocket;
        console.log('NEW_SOCKET ===> ', newRoomSocket);

        this.seabattleState.updateRooms([...this.rooms, newRoomSocket]);
    }

    private handleDisconnectionMsg(roomId: string, msg: DisconnectPlayerRespMsg): void {
        const room = this.rooms.find((r) => r.id === roomId);
        room!.data.players = room!.data.players.filter((p) => p.playerEmail === msg.data.player_email || p.playerId === msg.data.player_id);
        // @TODO use real check
        room!.data.players[0].isOwner = true;
    }

    private handlePlayerSetPositions(roomId: string, msg: PlayerSetPositionsRespMsg): void {
        const room = this.rooms.find((r) => r.id === roomId);
        const readyPlayer = room?.data.players.find((p) => p.playerEmail === msg.data.player_email || p.playerId === msg.data.player_id)!;
        readyPlayer.isReady = true;
    }

    private handleStep(roomId: string, msg: PlayerStepRespMsg): void {
        const room = this.rooms.find((r) => r.id === roomId);
        const steppingPlayer = room!.data.players.find(
            (p) => p.playerEmail === msg.data.player_email || p.playerId === msg.data.player_id
        )!;

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
        const room = this.rooms.find((r) => r.id === roomId)!;
        room.state = ROOM_STATE.END;
    }
}
