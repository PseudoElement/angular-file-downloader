import { Injectable } from '@angular/core';
import { SeaBattleApiService } from './sea-battle-api.service';
import { ConnectRoomReqBody, CreateRoomReqBody, RoomPlayer, RoomSocketData } from '../models/sea-battle-api-types';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { SocketReqMsg } from '../models/sea-battle-socket-req-types';
import {
    ConnectPlayerRespMsg,
    DisconnectPlayerRespMsg,
    PlayerSetPositionsRespMsg,
    PlayerStepRespMsg,
    SocketRespMsg,
    WinGameRespMsg
} from '../models/sea-battle-socket-resp-types';
import { BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SOCKET_RESP_TYPE } from '../constants/socket-constants';

export interface RoomSocket {
    socket: WebSocket;
    id: string;
    data: RoomSocketData;
}

@Injectable()
export class SeaBattleSocketService {
    private readonly _rooms$ = new BehaviorSubject<RoomSocket[]>([]);

    public readonly rooms$ = this._rooms$.asObservable();

    private get _rooms(): RoomSocket[] {
        return this._rooms$.value;
    }

    constructor(private readonly seabattleApiSrv: SeaBattleApiService, private readonly alertsSrv: AlertsService) {}

    private updateRooms(rooms: RoomSocket[]): void {
        this._rooms$.next(rooms);
    }

    public async createNewRoom(params: CreateRoomReqBody): Promise<void> {
        try {
            const resp = await this.seabattleApiSrv.createRoom(params);
            this.alertsSrv.showAlert({ text: 'Room created successfully!', type: 'success' });
        } catch (err) {
            console.log('createNewRoom_Error ==> ', err);
            this.alertsSrv.showAlert({ text: (err as HttpErrorResponse).error.message, type: 'error' });
        }
    }

    public async connectToExistingRoom(params: ConnectRoomReqBody): Promise<void> {
        const socket = this.seabattleApiSrv.connectToRoom(params);
        const roomInfo = await this.seabattleApiSrv.fetchRoomInfo(params);

        socket.addEventListener('message', (e) => this.listenSocketMessage(socket, roomInfo.room_id, e.data));
        socket.addEventListener('error', () => this.listenSocketError(roomInfo.room_id));
        socket.addEventListener('open', () => this.listenSocketOpen(roomInfo.room_id));
    }

    public sendMessage(socketId: string, msg: SocketReqMsg): void {
        const room = this._rooms.find((r) => r.id === socketId);
        room?.socket.send(JSON.stringify(msg));
    }

    public disconnectFromSocket(socketId: string): void {
        const room = this._rooms.find((r) => r.id === socketId);
        const filteredRooms = this._rooms.filter((r) => r.id !== socketId);
        this.updateRooms(filteredRooms);

        room?.socket.removeEventListener('message', (e) => this.listenSocketMessage(room.socket, room.id, e.data));
        room?.socket.removeEventListener('error', () => this.listenSocketError(room.id));
        room?.socket.removeEventListener('open', () => this.listenSocketOpen(room.id));

        room?.socket.close();
        this.alertsSrv.showAlert({ text: `You disconnected from room ${room?.data.room_name}`, type: 'success' });
    }

    private listenSocketError(socketId: string): void {
        const room = this._rooms.find((r) => r.id === socketId);
        this.alertsSrv.showAlert({ text: `Error occured trying to connect to room ${room?.data.room_name}`, type: 'error' });
    }

    private listenSocketMessage(socket: WebSocket, roomId: string, msg: SocketRespMsg): void {
        switch (msg.action_type) {
            case SOCKET_RESP_TYPE.CONNECT_PLAYER:
                this.handleConnectionMsg(socket, roomId, msg as ConnectPlayerRespMsg);
            case SOCKET_RESP_TYPE.DISCONNECT_PLAYER:
                this.handleDisconnectionMsg(roomId, msg as DisconnectPlayerRespMsg);
            case SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS:
                const setPosMsg = msg as PlayerSetPositionsRespMsg;
            case SOCKET_RESP_TYPE.STEP:
                const stepMsg = msg as PlayerStepRespMsg;
            case SOCKET_RESP_TYPE.WIN_GAME:
                const winGameMsg = msg as WinGameRespMsg;
            default:
                console.log(`Invalid SOCKET_RESP_TYPE ==> ${SOCKET_RESP_TYPE}`);
        }

        const room = this._rooms.find((r) => r.id === roomId);
        room?.data.messages.push(msg);
        this.updateRooms(this._rooms);
    }

    private listenSocketOpen(socketId: string): void {
        const room = this._rooms.find((r) => r.id === socketId);
        this.alertsSrv.showAlert({ text: `You connected to room ${room?.data.room_name}!`, type: 'success' });
    }

    private handleConnectionMsg(socket: WebSocket, roomId: string, msg: ConnectPlayerRespMsg): void {
        const me = {
            isOwner: msg.data.your_data.is_owner,
            playerEmail: msg.data.your_data.player_email,
            playerId: msg.data.your_data.player_id,
            positions: ''
        } satisfies RoomPlayer;
        const enemy = {
            isOwner: msg.data.enemy_data.is_owner,
            playerEmail: msg.data.enemy_data.player_email,
            playerId: msg.data.enemy_data.player_id,
            positions: ''
        } satisfies RoomPlayer;

        const newRoomSocket = {
            id: roomId,
            socket,
            data: {
                messages: [] as SocketRespMsg[],
                room_name: msg.data.room_name,
                room_id: msg.data.room_id,
                players: [me, enemy]
            }
        } as RoomSocket;

        this.updateRooms([...this._rooms, newRoomSocket]);
    }

    private handleDisconnectionMsg(roomId: string, msg: DisconnectPlayerRespMsg): void {
        const room = this._rooms.find((r) => r.id === roomId);
        room!.data.players = room!.data.players.filter((p) => p.playerEmail === msg.data.player_email || p.playerId === msg.data.player_id);
        // @TODO use real check
        room!.data.players[0].isOwner = true;
    }
}
