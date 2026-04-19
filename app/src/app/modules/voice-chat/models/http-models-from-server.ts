/*---------------------------------------------COMMON---------------------------------------------------*/

export interface UserFromServer {
    name: string;
    is_host: boolean;
    id: string;
    muted: boolean;
}

export interface RoomFromServer {
    users: UserFromServer[];
    name: string;
    id: string;
    max_users: number;
    host_name: string;
}

/*---------------------------------------------RESPONSES---------------------------------------------------*/
export interface CreateRoomRespBody {
    created_room: {
        room_id: string;
        room_name: string;
    };
}

export interface GetRoomByIdRespBody {
    room: RoomFromServer | null;
}

export interface GetRoomsListRespBody {
    rooms: RoomFromServer[];
}

/*------------------------------------------------------------------------------------------------*/
