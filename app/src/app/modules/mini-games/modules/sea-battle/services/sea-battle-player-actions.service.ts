import { Injectable } from '@angular/core';
import { SeaBattleStateService } from './sea-battle-state.service';
import { SeaBattleSocketService } from './sea-battle-socket.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SOCKET_RESP_TYPE } from '../constants/socket-constants';

@Injectable()
export class SeaBattlePlayerActionsService {
    constructor(
        private readonly sbStateSrv: SeaBattleStateService,
        private readonly sbSocketSrv: SeaBattleSocketService,
        private readonly authSrv: AuthService
    ) {}

    public async setPositions(roomId: string, myPositions: string): Promise<void> {
        this.sbSocketSrv.sendMessage(roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS,
            data: {
                player_positions: myPositions
            }
        });
        this.sbStateSrv.updatePlayerState(roomId, this.authSrv.user!.email, { positions: myPositions });
    }
}
