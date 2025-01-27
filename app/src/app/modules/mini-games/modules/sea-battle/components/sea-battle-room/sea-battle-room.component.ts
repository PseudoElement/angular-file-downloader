import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SeaBattleStateService } from '../../services/sea-battle-state.service';
import { filter, interval, map, Observable, startWith, switchMap, takeWhile, tap } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ROOM_STATUS, RoomStatus, SOCKET_RESP_TYPE } from '../../constants/socket-constants';
import { SeaBattleFieldService } from '../../services/sea-battle-field.service';
import { DELAY_BEFORE_STEP } from '../../constants/seabattle-consts';
import { SeabattleRoom } from '../../entities/room';

@Component({
    selector: 'app-sea-battle-room',
    templateUrl: './sea-battle-room.component.html',
    styleUrl: './sea-battle-room.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleRoomComponent implements OnDestroy {
    private readonly roomId: string;

    public readonly room$: Observable<SeabattleRoom> = this.sbStateSrv.rooms$.pipe(
        filter((rooms) => !!rooms.length),
        map((rooms) => rooms.find((r) => r.id === this.roomId)!)
    );

    public readonly yourPosiions$ = this.room$.pipe(
        map((room) => room.data.players.me.positions),
        // tap((yourPositions) => this.sbFieldSrv.updateYourPositions(yourPositions)),
        startWith('')
    );

    public readonly enemyPosiions$ = this.room$.pipe(
        map((room) => room.data.players.enemy?.positions || ''),
        // tap((enemyPositions) => this.sbFieldSrv.updateEnemyPositions(enemyPositions)),
        startWith('')
    );

    public readonly roomStatus$ = this.room$.pipe(
        map((room) => room.data.status),
        startWith(ROOM_STATUS.IDLE)
    );

    public readonly roomStatusText$ = this.room$.pipe(
        switchMap((room) =>
            room.data.status === ROOM_STATUS.DELAY_BEFORE_NEXT_STEP
                ? interval(1_000).pipe(
                      takeWhile((val) => val * 1_000 < DELAY_BEFORE_STEP),
                      switchMap((secs) => this.getUiTextByRoomStatus(room.data.status, secs))
                  )
                : this.getUiTextByRoomStatus(room.data.status)
        )
    );

    public readonly isChangeModeEnabled$ = this.sbFieldSrv.isChangeModeEnabled$;

    public readonly isReadyCtrl = new FormControl<boolean>(false);

    public readonly stepCtrl = new FormControl<string>('');

    public get isReady(): boolean {
        return this.isReadyCtrl.value!;
    }

    constructor(
        private readonly sbSocketSrv: SeaBattleSocketService,
        private readonly sbStateSrv: SeaBattleStateService,
        private readonly route: ActivatedRoute,
        private readonly authSrv: AuthService,
        private readonly router: Router,
        private readonly sbFieldSrv: SeaBattleFieldService
    ) {
        this.roomId = this.route.snapshot.paramMap.get('id')!;
    }

    ngOnDestroy(): void {
        this.sbSocketSrv.disconnectFromRoom(this.roomId, this.authSrv.user!.email);
    }

    public async sendPositions(): Promise<void> {
        this.sbSocketSrv.sendUpdatedPositions(
            this.roomId,
            `
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
        );
    }

    public start(): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            action_type: SOCKET_RESP_TYPE.START_GAME,
            player_email: this.authSrv.user?.email!,
            data: {}
        });
    }

    public sendStep(): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.STEP,
            data: {
                step: this.stepCtrl.value!
            }
        });
    }

    public disconnect(): void {
        this.router.navigate(['mini-games', 'sea-battle']);
    }

    public sendReadyStatus(): void {
        if (this.isReady) return;

        this.isReadyCtrl.setValue(!this.isReadyCtrl.value);
        this.sbSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.READY,
            data: {}
        });
    }

    public toggleChangeMode(): void {
        this.sbFieldSrv.toggleChangeMode(this.roomId);
    }

    private async getUiTextByRoomStatus(roomStatus: RoomStatus, secs?: number): Promise<string> {
        switch (roomStatus) {
            case ROOM_STATUS.IDLE:
                return 'Waiting for players!';
            case ROOM_STATUS.READY_ENEMY_NEXT_STEP:
            case ROOM_STATUS.READY_YOUR_NEXT_STEP:
                const nextSteppingPlayerEmail = this.sbStateSrv.rooms.find((room) => room.data.roomId === this.roomId);
                return `Waiting for step of ${nextSteppingPlayerEmail}.`;
            case ROOM_STATUS.END:
                return 'Game finished!';
            case ROOM_STATUS.DELAY_BEFORE_NEXT_STEP:
                const delay = (DELAY_BEFORE_STEP - Number(secs) * 1_000) / 1_000;
                return `Waiting for ${delay}...`;
            default:
                console.log('Unknown_Status ==> ', roomStatus);
                return 'Unknown state!!!';
        }
    }
}
