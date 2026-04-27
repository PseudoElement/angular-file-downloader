import { inject } from '@angular/core';
import { VoiceChatApiService } from '../services/voice-chat-api.service';
import { VoiceChatRoomService } from '../services/voice-chat-room.service';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { mediaChecker } from './media-check.guard';
import { userDataChecker } from './activation.guard';

export const masterGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
    const roomSrv = inject(VoiceChatRoomService);
    const apiSrv = inject(VoiceChatApiService);
    const alertsSrv = inject(AlertsService);
    const router = inject(Router);

    const mediaGuardResp = await mediaChecker(alertsSrv, router);
    if (mediaGuardResp instanceof UrlTree || !mediaGuardResp) return mediaGuardResp;

    const userDataResp = await userDataChecker(route, roomSrv, apiSrv, alertsSrv, router);
    return userDataResp;
};
