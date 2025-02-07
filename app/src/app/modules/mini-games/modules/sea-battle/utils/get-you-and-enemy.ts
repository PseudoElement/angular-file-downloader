import { AuthService } from 'src/app/core/auth/auth.service';
import { ConnectPlayerRespMsg } from '../models/sea-battle-socket-resp-types';
import { RoomPlayer } from '../models/sea-battle-api-types';
import { SeabattleRoom } from '../entities/room';

export interface YouAndEnemyData {
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

export function getYouAndEnemyFromResp(msg: ConnectPlayerRespMsg, authSrv: AuthService): YouAndEnemyData {
    const playerOfRoom = {} as YouAndEnemyData;
    const players = [msg.data.player_1, msg.data.player_2];
    for (const player of players) {
        if (player.player_email === authSrv.user?.email) {
            playerOfRoom.your_data = player;
        } else {
            playerOfRoom.enemy_data = player;
        }
    }

    return playerOfRoom;
}

export function isYou(email: string, authSrv: AuthService): boolean {
    return email === authSrv.user?.email;
}

export function whoStepsFirst(room: SeabattleRoom): RoomPlayer {
    if (room.data.players.me.isOwner) {
        return room.data.players.me;
    }
    return room.data.players.enemy!;
}
