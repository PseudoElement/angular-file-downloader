import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SeaBattleRoomComponent } from '../components/sea-battle-room/sea-battle-room.component';
import { SeaBattleStateService } from '../services/sea-battle-state.service';
import { SeaBattleSocketService } from '../services/sea-battle-socket.service';
import { AuthService } from 'src/app/core/auth/auth.service';

export async function canDeactivateSeabattleRoom(
    component: SeaBattleRoomComponent,
    routeSnapshot: ActivatedRouteSnapshot
): Promise<boolean> {
    const seabattleStateSrv = inject(SeaBattleStateService);
    const seabattleSocketSrv = inject(SeaBattleSocketService);
    const sintolModalSrv = inject(SintolLibDynamicComponentService);
    const authSrv = inject(AuthService);

    const roomId = routeSnapshot.paramMap.get('id')!;
    const foundRoom = seabattleStateSrv.rooms.find((r) => r.data.room_id === roomId)!;

    const wantLeave = await sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
        isConfirmModal: true,
        text: `Do you want to leave room "${foundRoom.data.room_name}"?`,
        title: 'Notification'
    });

    if (!wantLeave) {
        return false;
    }

    await seabattleSocketSrv.disconnectFromRoom(roomId, authSrv.user?.email!);

    return wantLeave;
}
