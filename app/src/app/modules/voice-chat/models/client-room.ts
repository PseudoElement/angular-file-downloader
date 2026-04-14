import { VoicechatUser } from '../entities/voicechat-user';
import { UserFromServer } from './http-models-from-server';

export interface VoicechatRooom {
    users: VoicechatUser[];
    me: UserFromServer;
    name: string;
    id: string;
    max_users: number;
    host_name: string;
}
