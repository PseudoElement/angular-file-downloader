import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { GetRoomByIdRespBody } from '../models/http-models-from-server';
import { VoiceChatApiService } from '../services/voice-chat-api.service';

export const voiceRoomResolver: ResolveFn<GetRoomByIdRespBody> = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router = inject(Router);
    const voicechatApi = inject(VoiceChatApiService);
    const roomId = route.paramMap.get('id');
    if (!roomId) return new RedirectCommand(router.parseUrl('/voicechat'));
    try {
        return await voicechatApi.fetchRoomById(roomId);
    } catch {
        return new RedirectCommand(router.parseUrl('/voicechat'));
    }
};
