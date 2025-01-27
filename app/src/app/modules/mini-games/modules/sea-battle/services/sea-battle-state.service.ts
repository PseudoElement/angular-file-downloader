import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SeabattleRoom } from '../entities/room';

@Injectable({ providedIn: 'root' })
export class SeaBattleStateService {
    private readonly _rooms$ = new BehaviorSubject<SeabattleRoom[]>([]);

    public readonly rooms$ = this._rooms$.asObservable();

    public get rooms(): SeabattleRoom[] {
        return this._rooms$.value;
    }

    constructor(private readonly authSrv: AuthService) {}

    public updateRooms(rooms: SeabattleRoom[]): void {
        this._rooms$.next(rooms);
    }

    public getRoomById(roomId: string): SeabattleRoom {
        return this.rooms.find((r) => r.id === roomId)!;
    }

    public leaveRoom(roomId: string): void {
        const filtered = this.rooms.filter((r) => r.data.roomId !== roomId);
        this.updateRooms(filtered);
    }
}
