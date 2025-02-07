import { AuthService } from 'src/app/core/auth/auth.service';
import { ROOM_STATUS, STEP_RESULT } from '../constants/socket-constants';
import { SeabattleRoom } from '../entities/room';
import { PlayerStepRespMsg } from '../models/sea-battle-socket-resp-types';
import { isYou } from './get-you-and-enemy';
import { DELAY_BEFORE_STEP } from '../constants/seabattle-consts';
import { SeaBattleStateService } from '../services/sea-battle-state.service';

export function handleNextStepOrder(
    room: SeabattleRoom,
    msg: PlayerStepRespMsg,
    authSrv: AuthService,
    sbStateSrv: SeaBattleStateService
): void {
    room.updateData({ status: ROOM_STATUS.DELAY_BEFORE_NEXT_STEP });
    setTimeout(() => {
        // another player should step
        if (msg.data.step_result === STEP_RESULT.MISS) {
            const newStatus = isYou(msg.data.player_email, authSrv) ? ROOM_STATUS.READY_ENEMY_NEXT_STEP : ROOM_STATUS.READY_YOUR_NEXT_STEP;
            const whoStepsNext = isYou(msg.data.player_email, authSrv) ? room.data.players.enemy : room.data.players.me;
            room.updateData({ status: newStatus, steppingPlayer: whoStepsNext });
        }
        // prev player need step one more time
        else {
            const newStatus = isYou(msg.data.player_email, authSrv) ? ROOM_STATUS.READY_YOUR_NEXT_STEP : ROOM_STATUS.READY_ENEMY_NEXT_STEP;
            const whoStepsNext = isYou(msg.data.player_email, authSrv) ? room.data.players.me : room.data.players.enemy;
            room.updateData({ status: newStatus, steppingPlayer: whoStepsNext });
        }

        // sbStateSrv.updateRooms(sbStateSrv.rooms);
    }, DELAY_BEFORE_STEP);
}
