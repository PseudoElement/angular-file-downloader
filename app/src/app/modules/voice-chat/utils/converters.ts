import { VoicechatUser } from '../entities/voicechat-user';
import { VoicechatRooom } from '../models/client-room';
import { RoomFromServer, UserFromServer } from '../models/http-models-from-server';

export function randomHexColor(): string {
    return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
}

export function serverRoomToUiRoom(serverRoom: RoomFromServer, me: UserFromServer, clientUsers: VoicechatUser[]): VoicechatRooom {
    return {
        host_name: clientUsers.find((u) => u.isHost)?.userName ?? me.name,
        me,
        id: serverRoom.id,
        max_users: serverRoom.max_users,
        name: serverRoom.name,
        users: clientUsers
    };
}
