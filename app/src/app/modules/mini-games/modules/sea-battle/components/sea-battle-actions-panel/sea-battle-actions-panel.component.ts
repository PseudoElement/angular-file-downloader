import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsService } from 'src/app/shared/services/alerts.service';

@Component({
    selector: 'app-sea-battle-actions-panel',
    templateUrl: './sea-battle-actions-panel.component.html',
    styleUrl: './sea-battle-actions-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleActionsPanelComponent {
    public readonly playerNameCtrl = new FormControl<string>('', [Validators.required]);

    constructor(
        private readonly seabattleSocketSrv: SeaBattleSocketService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly authService: AuthService,
        private readonly alertsSrv: AlertsService
    ) {
        this.playerNameCtrl.valueChanges.pipe(debounceTime(500), takeUntilDestroyed()).subscribe((email) => {
            this.authService.setUserEmail(email || '');
        });
    }

    public async createRoom(): Promise<void> {
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });
        if (!roomName) {
            this.alertsSrv.showAlert({ text: 'Room name is required.', type: 'warn' });
            return;
        }
        if (!this.playerNameCtrl.value) {
            this.playerNameCtrl.markAsTouched();
            this.alertsSrv.showAlert({ text: 'Input player name.', type: 'warn' });
            return;
        }
        this.seabattleSocketSrv.createAndConnectToNewRoom({
            player_email: this.playerNameCtrl.value,
            room_name: roomName
        });
    }
}
