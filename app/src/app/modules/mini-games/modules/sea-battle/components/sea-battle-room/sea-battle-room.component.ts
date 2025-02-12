import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SeaBattleStateService } from '../../services/sea-battle-state.service';
import { BehaviorSubject, filter, interval, map, Observable, of, startWith, switchMap, takeWhile } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ROOM_STATUS, SOCKET_RESP_TYPE } from '../../constants/socket-constants';
import { SeaBattleFieldService } from '../../services/sea-battle-field.service';
import { DELAY_BEFORE_STEP } from '../../constants/seabattle-consts';
import { SeabattleRoom } from '../../entities/room';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PlayerPosition } from '../../models/positions';

@Component({
    selector: 'app-sea-battle-room',
    templateUrl: './sea-battle-room.component.html',
    styleUrl: './sea-battle-room.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('roomStatusAnimation', [
            state('true', style({ opacity: 1, transform: 'translateY(0)' })),
            state('false', style({ opacity: 0, transform: 'translateY(-30px)' })),
            transition('true <=> false', animate('100ms ease-out'))
        ])
    ]
})
export class SeaBattleRoomComponent implements OnDestroy {
    private readonly roomId: string;

    public readonly _roomStatusUpdate$ = new BehaviorSubject<boolean>(true);

    public readonly room$: Observable<SeabattleRoom> = this.sbStateSrv.rooms$.pipe(
        filter((rooms) => !!rooms.length),
        map((rooms) => rooms.find((r) => r.id === this.roomId)!)
    );

    public readonly yourPosiions$ = this.room$.pipe(
        map((room) => room?.data.players.me.positions),
        startWith('')
    );

    public readonly enemyPosiions$ = this.room$.pipe(
        map((room) => room?.data.players.enemy?.positions || ''),
        startWith('')
    );

    public readonly roomStatus$ = this.room$.pipe(
        map((room) => room?.data.status || ROOM_STATUS.IDLE),
        startWith(ROOM_STATUS.IDLE)
    );

    public readonly roomStatusText$ = this.room$.pipe(
        switchMap((room) =>
            room?.data.status === ROOM_STATUS.DELAY_BEFORE_NEXT_STEP
                ? interval(1_000).pipe(
                      takeWhile((val) => (val - 1) * 1_000 < DELAY_BEFORE_STEP),
                      map((secs) => this.room.utils.getUiTextByRoomStatus(room?.data.status, secs))
                  )
                : of(this.room.utils.getUiTextByRoomStatus(room?.data.status))
        )
    );

    public readonly isChangeModeEnabled$ = this.sbFieldSrv.isChangeModeEnabled$;

    public get isReady(): boolean {
        return this.room.data.players.me.isReady;
    }

    public get room(): SeabattleRoom {
        return this.sbStateSrv.getRoomById(this.roomId);
    }

    public get canStart(): boolean {
        return this.room.isYouOwner && this.room.data.status === ROOM_STATUS.READY_TO_START;
    }

    public get canReset(): boolean {
        return this.room.isYouOwner && this.room.data.status === ROOM_STATUS.END;
    }

    public get isDisabledReadyBtn(): boolean {
        return this.isReady || !this.room.data.players.me.isSetPositions || !this.canUseChangeMode;
    }

    public get canSendPositions(): boolean {
        return this.sbFieldSrv.canSendUpdatedPositions;
    }

    public get canUseChangeMode(): boolean {
        return !this.room.isPlaying && !this.isReady && this.room.hasBothPlayers;
    }

    public get canMakeStep(): boolean {
        return this.room.isPlaying && this.room.status === ROOM_STATUS.READY_YOUR_NEXT_STEP;
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
        this.roomStatus$.subscribe(() => {
            this._roomStatusUpdate$.next(false);
            setTimeout(() => this._roomStatusUpdate$.next(true), 200);
        });
    }

    ngOnDestroy(): void {
        this.sbSocketSrv.disconnectFromRoom(this.roomId, this.authSrv.user!.email);
    }

    public async sendPositions(): Promise<void> {
        // @FIX validate player positions
        this.sbSocketSrv.sendUpdatedPositions(this.roomId, this.sbFieldSrv.yourPositionsStr);
        this.sbFieldSrv.setCanSendUpdatedPositions(false);
    }

    public start(): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            action_type: SOCKET_RESP_TYPE.START_GAME,
            player_email: this.authSrv.user?.email!,
            data: {}
        });

        this.room.updateData({ status: ROOM_STATUS.PROCESSING });
    }

    // on finish to clear positions
    public reset(): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.RESET,
            data: {}
        });
    }

    public onEnemyCellSelected(playerPosition: PlayerPosition): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.STEP,
            data: { step: playerPosition.value }
        });
    }

    public disconnect(): void {
        this.router.navigate(['mini-games', 'sea-battle']);
    }

    public sendReadyStatus(): void {
        this.sbSocketSrv.sendMessage(this.roomId, {
            player_email: this.authSrv.user?.email!,
            action_type: SOCKET_RESP_TYPE.READY,
            data: {}
        });
    }

    public toggleChangeMode(): void {
        this.sbFieldSrv.toggleChangeMode(this.roomId);
    }
}
