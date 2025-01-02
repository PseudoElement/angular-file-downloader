export interface CreateRoomReqBody {
    player_email: string;
    room_name: string;
}

export interface DisconnectRoomReqBody extends CreateRoomReqBody {}

export interface ConnectRoomReqBody {
    player_email: string;
    room_name: string;
    room_id?: string;
}

export interface SuccessResp {
    message: string;
}
