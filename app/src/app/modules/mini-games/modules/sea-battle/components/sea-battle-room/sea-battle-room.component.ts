import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SeaBattleStateService } from '../../services/sea-battle-state.service';
import { filter, map, Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { RoomSocket } from '../../models/sea-battle-api-types';
import { SOCKET_RESP_TYPE } from '../../constants/socket-constants';

@Component({
    selector: 'app-sea-battle-room',
    templateUrl: './sea-battle-room.component.html',
    styleUrl: './sea-battle-room.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleRoomComponent {
    private readonly roomId: string;

    public readonly room$: Observable<RoomSocket> = this.seabattleStateSrv.rooms$.pipe(
        tap((r) => console.log('ROOMS_+LISTTT ==> ', r)),
        filter((rooms) => !!rooms.length),
        map((rooms) => rooms.find((r) => r.data.room_id === this.roomId)!),
        tap((r) => console.log('ROOM$ ==> ', r))
    );

    public readonly yourPosiions$ = this.room$.pipe(map((room) => room.data.players.me));

    public readonly enemyPosiions$ = this.room$.pipe(map((room) => room.data.players.enemy));

    public readonly playerNameCtrl = new FormControl<string>('');

    public readonly stepCtrl = new FormControl<string>('');

    constructor(
        private readonly seabattleSocketSrv: SeaBattleSocketService,
        private readonly seabattleStateSrv: SeaBattleStateService,
        private readonly route: ActivatedRoute,
        private readonly authSrv: AuthService
    ) {
        this.roomId = this.route.snapshot.paramMap.get('id')!;
    }

    public async sendPositions(): Promise<void> {
        this.seabattleSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.SET_PLAYER_POSITIONS,
            data: {
                player_positions: `
		A1+,A2,A3,A4,A5,A6,A7,A8,A9,A10+,
		B1+,B2,B3,B4,B5,B6,B7,B8,B9,B10+,
		C1+,C2,C3,C4,C5,C6,C7,C8,C9,C10+,
		D1+,D2,D3,D4,D5,D6,D7,D8,D9,D10+,
		E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,
		F1+*,F2+,F3,F4,F5,F6,F7,F8,F9,F10+,
		G1,G2,G3,G4,G5,G6,G7,G8,G9,G10,
		H1+*,H2,H3,H4,H5,H6,H7,H8,H9,H10+,
		I1+*,I2,I3,I4,I5,I6,I7,I8,I9,I10+,
		J1+,J2,J3+,J4,J5+*,J6,J7,J8,J9,J10+,
		`
            }
        });
    }

    public async sendStep(): Promise<void> {
        this.seabattleSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.STEP,
            data: {
                step: this.stepCtrl.value!
            }
        });
    }

    public disconnect(): void {
        this.seabattleSocketSrv.disconnectFromRoom(this.roomId, this.authSrv.user!.email);
    }
}
