import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { VoiceChatRoomService } from '../services/voice-chat-room.service';
import { VoiceChatApiService } from '../services/voice-chat-api.service';
import { AlertsService } from 'src/app/shared/services/alerts.service';

export const activationGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
    const roomSrv = inject(VoiceChatRoomService);
    const apiSrv = inject(VoiceChatApiService);
    const alertsSrv = inject(AlertsService);
    const router = inject(Router);

    if (roomSrv.me) return true;

    const roomId = route.paramMap.get('id');
    if (!roomId) return router.parseUrl('/voicechat');

    const resp = await apiSrv.fetchRoomById(roomId);
    if (!resp.room) {
        alertsSrv.showAlert({ text: `Room with id ${roomId} not found.`, type: 'warn' });
        return router.parseUrl('/voicechat');
    }

    const success = await roomSrv.connectToVoiceRoom(roomId);
    return success ? true : router.parseUrl('/voicechat');
};

export const userDataChecker = async (
    route: ActivatedRouteSnapshot,
    roomSrv: VoiceChatRoomService,
    apiSrv: VoiceChatApiService,
    alertsSrv: AlertsService,
    router: Router
): Promise<boolean | UrlTree> => {
    if (roomSrv.me) return true;

    const roomId = route.paramMap.get('id');
    if (!roomId) return router.parseUrl('/voicechat');

    const resp = await apiSrv.fetchRoomById(roomId);
    if (!resp.room) {
        alertsSrv.showAlert({ text: `Room with id ${roomId} not found.`, type: 'warn' });
        return router.parseUrl('/voicechat');
    }

    const success = await roomSrv.connectToVoiceRoom(roomId);
    return success;
};
