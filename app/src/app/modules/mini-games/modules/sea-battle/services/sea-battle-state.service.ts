import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoomPlayer, RoomSocket, RoomSocketData } from '../models/sea-battle-api-types';
import { AuthService } from 'src/app/core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class SeaBattleStateService {
    private readonly _rooms$ = new BehaviorSubject<RoomSocket[]>([]);

    public readonly rooms$ = this._rooms$.asObservable();

    public get rooms(): RoomSocket[] {
        return this._rooms$.value;
    }

    constructor(private readonly authSrv: AuthService) {}

    public updateRooms(rooms: RoomSocket[]): void {
        this._rooms$.next(rooms);
    }

    public updatePlayerState(roomId: string, playerEmail: string, newProps: Partial<RoomPlayer>): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;

        let playerKey: keyof RoomSocketData['players'] = this.authSrv.user?.email === playerEmail ? 'me' : 'enemy';
        const updatedPlayer = { ...room.data.players[playerKey]!, ...newProps } as RoomPlayer;
        room.data.players = { ...room.data.players, [playerKey]: updatedPlayer };

        console.log('updatePlayerState ==> ', room);
    }

    public removeEnemyFromRoom(roomId: string): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        room.data.players = { enemy: null, me: room.data.players.me };
    }

    public makePlayerAsOwner(roomId: string, playerEmail: string): void {
        const room = this.rooms.find((r) => r.data.room_id === roomId)!;
        const playerKey: keyof RoomSocketData['players'] = playerEmail === this.authSrv.user?.email ? 'me' : 'enemy';
        room.data.players = {
            ...room.data.players,
            [playerKey]: { ...room.data.players[playerKey], isOwner: true }
        } as RoomSocketData['players'];
    }
}
