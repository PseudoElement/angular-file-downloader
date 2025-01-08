import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from '../shared/components/modal/modal.component';

export const matcherGuard: CanMatchFn = async (route, segments): Promise<boolean> => {
    const sintolModalSrv = inject(SintolLibDynamicComponentService);
    const router = inject(Router);

    if (window.location.pathname === '/tutorial') {
        await sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
            isConfirmModal: false,
            text: `You are not allowed visit "License" page from route /${route.path}`,
            title: 'Warning'
        });
        router.navigate(['download-files']);
        return false;
    }

    const ok = await sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
        isConfirmModal: true,
        text: `Do you want to visit /${route.path}?`,
        title: 'Notification'
    });

    if (!ok) router.navigate(['download-files']);

    return ok;
};
