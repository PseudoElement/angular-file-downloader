import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-sea-battle-actions-panel',
    templateUrl: './sea-battle-actions-panel.component.html',
    styleUrl: './sea-battle-actions-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleActionsPanelComponent {
    public readonly roomNameCtrl = new FormControl<string>('');

    public readonly playerNameCtrl = new FormControl<string>('');

    constructor(
        private readonly seabattleSocketSrv: SeaBattleSocketService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly authService: AuthService
    ) {
        this.playerNameCtrl.valueChanges.pipe(debounceTime(500)).subscribe((email) => {
            console.log(email);
            this.authService.setUserEmail(email || '');
        });
    }

    public async createRoom(): Promise<void> {
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });
        this.seabattleSocketSrv.createAndConnectToNewRoom({
            player_email: this.authService.user!.email!,
            room_name: roomName
        });
    }
}
