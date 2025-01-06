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

export interface DisconnectRoomReqBody extends CreateRoomReqBody {}

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
}

export interface RoomInfoResp {
    room_id: string;
    room_name: string;
    created_at: string;
    your_data: {
        player_id: string;
        player_email: string;
        is_owner: boolean;
    };
    enemy_data: {
        player_id: string;
        player_email: string;
        is_owner: boolean;
    };
}
