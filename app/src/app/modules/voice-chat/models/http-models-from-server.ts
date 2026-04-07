export interface CreateRoomRespBody {
    message: string;
    data: {
        room_id: string;
        room_name: string;
    };
}
