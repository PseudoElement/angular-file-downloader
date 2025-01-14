import { RoomState } from '../constants/socket-constants';
import { SocketRespMsg } from './sea-battle-socket-resp-types';

export interface CreateRoomReqBody {
    player_email: string;
    room_name: string;
}

export interface RoomInfoReqBody {
    player_email: string;
    room_name: string;
}

export interface DisconnectRoomReqBody {
    player_email: string;
    room_id: string;
}

export interface ConnectRoomReqBody {
    player_email: string;
    room_name: string;
    room_id?: string;
}

export interface RoomSocket {
    socket: WebSocket;
    state: RoomState;
    data: RoomSocketData;
}

export interface RoomSocketData {
    messages: SocketRespMsg[];
    room_name: string;
    room_id: string;
    created_at: string;
    players: {
        me: RoomPlayer;
        enemy: RoomPlayer | null;
    };
}

export interface RoomPlayer {
    playerEmail: string;
    playerId: string;
    positions: string;
    isOwner: boolean;
    isReady: boolean;
    hasFall: boolean;
}

interface PlayerInfoFromBackend {
    player_id: string;
    player_email: string;
    is_owner: boolean;
}

export interface RoomInfoFromBackend {
    room_id: string;
    room_name: string;
    created_at: string;
    players: PlayerInfoFromBackend[];
}

export interface RoomInfoResp {
    room_id: string;
    room_name: string;
    created_at: string;
    your_data: PlayerInfoFromBackend;
    enemy_data: PlayerInfoFromBackend;
}

export interface RoomsMapResp {
    rooms: {
        [roomId: string]: RoomInfoFromBackend;
    };
}

export type RoomsArray = Array<RoomInfoFromBackend>;
