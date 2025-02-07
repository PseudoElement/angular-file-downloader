import { AuthService } from 'src/app/core/auth/auth.service';
import { RoomPlayer, SeabattleRoomData } from '../models/sea-battle-api-types';
import { isYou, YouAndEnemyData } from '../utils/get-you-and-enemy';
import { SocketRespMsg } from '../models/sea-battle-socket-resp-types';
import { ROOM_STATUS, RoomStatus } from '../constants/socket-constants';
import { CLEAR_SEABATTLE_FIELD, DELAY_BEFORE_STEP } from '../constants/seabattle-consts';
import { SeabattleRoomUtils } from './room-utils';

export interface SeabattleRoomInitStruct {
    roomName: string;
    roomId: string;
    createdAt: string;
    playersOfRoom: YouAndEnemyData;
}

export class SeabattleRoom {
    private readonly _socket: WebSocket;

    private _data: SeabattleRoomData;

    public get socket(): WebSocket {
        return this._socket;
    }

    public get id(): string {
        return this._data.roomId;
    }

    public get hasEnemy(): boolean {
        return !!this._data.players.enemy?.playerEmail;
    }

    public get hasBothPlayers(): boolean {
        return !!this._data.players.me.playerEmail && !!this.data.players.enemy?.playerEmail;
    }

    public get isPlaying(): boolean {
        return this._data.isPlaying;
    }

    public get isYouOwner(): boolean {
        return this._data.players.me.isOwner;
    }

    public get data(): SeabattleRoomData {
        return this._data;
    }

    public get status(): RoomStatus {
        return this._data.status;
    }

    public readonly utils: SeabattleRoomUtils;

    constructor(socket: WebSocket, initStruct: SeabattleRoomInitStruct, private readonly authSrv: AuthService) {
        this._socket = socket;
        this.utils = new SeabattleRoomUtils(this);

        const me = {
            isOwner: initStruct.playersOfRoom.your_data.is_owner,
            playerEmail: initStruct.playersOfRoom.your_data.player_email,
            playerId: initStruct.playersOfRoom.your_data.player_id,
            positions: CLEAR_SEABATTLE_FIELD,
            isReady: false,
            hasFall: false
        } satisfies RoomPlayer;
        const enemy = {
            isOwner: initStruct.playersOfRoom.enemy_data.is_owner,
            playerEmail: initStruct.playersOfRoom.enemy_data.player_email,
            playerId: initStruct.playersOfRoom.enemy_data.player_id,
            positions: CLEAR_SEABATTLE_FIELD,
            isReady: false,
            hasFall: false
        } satisfies RoomPlayer;

        this._data = {
            messages: [] as SocketRespMsg[],
            roomName: initStruct.roomName,
            roomId: initStruct.roomId,
            status: ROOM_STATUS.IDLE,
            createdAt: initStruct.createdAt,
            steppingPlayer: null,
            isPlaying: false,
            players: { me, enemy }
        };
    }

    public updateData(newData: Partial<SeabattleRoomData>): void {
        this._data = { ...this._data, ...newData };
    }

    public updatePlayerInRoom(playerEmail: string, newProps: Partial<RoomPlayer>): void {
        const playerKey: keyof SeabattleRoomData['players'] = isYou(playerEmail, this.authSrv) ? 'me' : 'enemy';
        const updatedPlayer = { ...this._data.players[playerKey]!, ...newProps } as RoomPlayer;
        this._data.players = { ...this._data.players, [playerKey]: updatedPlayer };
    }

    public removeEnemyFromRoom(): void {
        this._data.players = { enemy: null, me: this._data.players.me };
    }

    public makePlayerAsOwner(playerEmail: string): void {
        const playerKey: keyof SeabattleRoomData['players'] = playerEmail === this.authSrv.user?.email ? 'me' : 'enemy';
        this._data.players = {
            ...this._data.players,
            [playerKey]: { ...this._data.players[playerKey], isOwner: true }
        } as SeabattleRoomData['players'];
    }
}
