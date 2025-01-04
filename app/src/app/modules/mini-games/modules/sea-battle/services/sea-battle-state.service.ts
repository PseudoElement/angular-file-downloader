import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoomSocket } from '../models/sea-battle-api-types';

@Injectable()
export class SeaBattleStateService {
    private readonly _rooms$ = new BehaviorSubject<RoomSocket[]>([]);

    public readonly rooms$ = this._rooms$.asObservable();

    public get rooms(): RoomSocket[] {
        return this._rooms$.value;
    }

    public updateRooms(rooms: RoomSocket[]): void {
        this._rooms$.next(rooms);
    }
}
