import { AuthService } from 'src/app/core/auth/auth.service';
import { ROOM_STATUS, STEP_RESULT } from '../constants/socket-constants';
import { SeabattleRoom } from '../entities/room';
import { PlayerStepRespMsg } from '../models/sea-battle-socket-resp-types';
import { isYou } from './get-you-and-enemy';

export function handleNextStepOrder(room: SeabattleRoom, msg: PlayerStepRespMsg, authSrv: AuthService): void {
    const whoWasAffected = isYou(msg.data.player_email, authSrv) ? room.data.players.enemy! : room.data.players.me;

    room.updateData({
        status: ROOM_STATUS.DELAY_BEFORE_NEXT_STEP,
        steppingPlayer: whoWasAffected
    });

    setTimeout(() => {
        // another player should step
        if (msg.data.step_result === STEP_RESULT.MISS) {
            const newStatus = isYou(msg.data.player_email, authSrv) ? ROOM_STATUS.READY_ENEMY_NEXT_STEP : ROOM_STATUS.READY_TO_START;
            room.updateData({ status: newStatus });
        }
        // prev player need step one more time
        else {
            const newStatus = isYou(msg.data.player_email, authSrv) ? ROOM_STATUS.READY_YOUR_NEXT_STEP : ROOM_STATUS.READY_ENEMY_NEXT_STEP;
            room.updateData({ status: newStatus });
        }
    }, 5_000);
}
