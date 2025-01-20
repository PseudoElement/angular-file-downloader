import { ConnectPlayerRespMsg } from '../models/sea-battle-socket-resp-types';

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

export function getYouAndEnemyFromResp(msg: ConnectPlayerRespMsg, yourEmail: string): YouAndEnemyData {
    const playerOfRoom = {} as YouAndEnemyData;
    const players = [msg.data.player_1, msg.data.player_2];
    for (const player of players) {
        if (player.player_email === yourEmail) {
            playerOfRoom.your_data = player;
        } else {
            playerOfRoom.enemy_data = player;
        }
    }

    return playerOfRoom;
}
