import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { VoiceChatRoomService } from '../services/voice-chat-room.service';

export const activationGuard = () => {
    // const roomSrv = inject(VoiceChatRoomService);
    const router = inject(Router);

    const prevNavigation = router.getCurrentNavigation()?.previousNavigation;
    if (!prevNavigation) return router.parseUrl('/voicechat');
    return true;
    // if (roomSrv.me) return true;
    // return router.parseUrl('/voicechat');
};
