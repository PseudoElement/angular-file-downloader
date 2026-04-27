import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AlertsService } from 'src/app/shared/services/alerts.service';

export const mediaCheckGuard: CanActivateFn = async () => {
    const alertsSrv = inject(AlertsService);
    const router = inject(Router);

    const microphoneState = await navigator.permissions.query({ name: 'microphone' as PermissionName }).then((s) => s.state);
    console.log('microphoneState ==>', microphoneState);
    if (microphoneState === 'granted') return true;

    if (microphoneState === 'prompt') {
        const allowed = await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => true)
            .catch(() => false);

        if (allowed) return true;

        alertsSrv.showAlert({ text: 'Allow microphone to join room.', type: 'warn' });
        return router.parseUrl('/voicechat');
    }

    alertsSrv.showAlert({
        text: 'You disabled microphone. Go to site settings and allow use microphone, then connect in room.',
        type: 'warn'
    });
    return router.parseUrl('/voicechat');
};

export const mediaChecker = async (alertsSrv: AlertsService, router: Router): Promise<UrlTree | boolean> => {
    const microphoneState = await navigator.permissions.query({ name: 'microphone' as PermissionName }).then((s) => s.state);
    if (microphoneState === 'granted') return true;

    if (microphoneState === 'prompt') {
        const allowed = await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => true)
            .catch(() => false);

        if (allowed) return true;

        alertsSrv.showAlert({ text: 'Allow microphone to join room.', type: 'warn' });
        return router.parseUrl('/voicechat');
    }

    alertsSrv.showAlert({
        text: 'You disabled microphone. Go to site settings and allow use microphone, then connect in room.',
        type: 'warn'
    });
    return router.parseUrl('/voicechat');
};
