import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlSegment } from '@angular/router';
import { SeaBattleStateService } from '../services/sea-battle-state.service';
import { AlertsService } from 'src/app/shared/services/alerts.service';

export function isRoomWithIdExistGuard(_routeSnapshot: any, segments: UrlSegment[]): boolean {
    const seabattleStateSrv = inject(SeaBattleStateService);
    const alertsSrv = inject(AlertsService);
    const router = inject(Router);

    const roomId = segments[1]?.path;
    const foundRoom = seabattleStateSrv.rooms.some((r) => r.data.room_id === roomId);

    if (!foundRoom) {
        console.log(`Room with id ${roomId} doesn't exist. Existing rooms is ==> `, seabattleStateSrv.rooms);
        router.navigate(['mini-games', 'sea-battle']);
        alertsSrv.showAlert({ text: `Room with id ${roomId} doesn't exist.`, type: 'warn' });
        return false;
    }

    return true;
}
