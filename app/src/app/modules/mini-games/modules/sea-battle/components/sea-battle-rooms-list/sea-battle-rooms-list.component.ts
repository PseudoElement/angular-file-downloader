import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, interval, startWith, Subject, switchMap, tap, throttle, throttleTime } from 'rxjs';
import { RoomInfoFromBackend, RoomsArray } from '../../models/sea-battle-api-types';
import { SeaBattleApiService } from '../../services/sea-battle-api.service';
import { roomsMapToArray } from '../../utils/rooms-map-converter';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
    selector: 'app-sea-battle-rooms-list',
    templateUrl: './sea-battle-rooms-list.component.html',
    styleUrl: './sea-battle-rooms-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleRoomsListComponent {
    private readonly _updateRoomsList$ = new Subject();

    public readonly roomsList$ = new BehaviorSubject<RoomsArray>([]);

    constructor(
        private readonly seabattleApiSrv: SeaBattleApiService,
        private readonly seabattleSocketSrv: SeaBattleSocketService,
        private readonly authService: AuthService
    ) {
        setTimeout(() => this._updateRoomsList$.next(null), 0);
        combineLatest([this._updateRoomsList$, interval(10_000).pipe(startWith(0))])
            .pipe(
                throttleTime(10_000),
                switchMap(() => this.seabattleApiSrv.fetchRoomsMapFromBackend()),
                takeUntilDestroyed()
            )
            .subscribe((roomsMap) => {
                this.roomsList$.next(roomsMapToArray(roomsMap));
            });
    }

    public getList(): void {
        this._updateRoomsList$.next(null);
    }

    public formatDate(date: string): string {
        const splitted = new Date(date).toTimeString().split(' ');
        return `${splitted?.[0]} ${splitted?.[1].slice(0, splitted[1].length - 2)}`;
    }

    public getRoomPlayersNames(room: RoomInfoFromBackend): string {
        if (!Object.values(room.players).length) return '';

        return (
            Object.values(room.players)
                .map((p) => p.player_email)
                .join(', ') + '.'
        );
    }

    public async connectToRoom(room: RoomInfoFromBackend): Promise<void> {
        this.seabattleSocketSrv.connectToRoom({
            player_email: this.authService.user!.email,
            room_name: room.room_name,
            room_id: room.room_id
        });
    }
}
