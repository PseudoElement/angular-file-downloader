import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SeaBattleSocketService } from '../../services/sea-battle-socket.service';

@Component({
    selector: 'app-sea-battle-actions-panel',
    templateUrl: './sea-battle-actions-panel.component.html',
    styleUrl: './sea-battle-actions-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleActionsPanelComponent {
    public readonly roomNameCtrl = new FormControl<string>('');

    public readonly playerNameCtrl = new FormControl<string>('');

    public readonly stepCtrl = new FormControl<string>('');

    constructor(
        private readonly seabattleSocketSrv: SeaBattleSocketService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly authService: AuthService
    ) {}

    public async createRoom(): Promise<void> {
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });
        this.seabattleSocketSrv.createAndConnectToNewRoom({
            player_email: this.playerNameCtrl.value!,
            room_name: roomName
        });
    }

    public async connect(): Promise<void> {
        const roomName = await this.sintolModalSrv.openConfirmModal<ConfirmModalComponent, string>(ConfirmModalComponent, {
            title: 'Modal',
            text: 'Input room name.'
        });
        // @TODO uncomment after email release
        // this.seabattleSocketSrv.connectToRoom({ player_email: this.authService.user!.email, room_name: roomName });
        this.seabattleSocketSrv.connectToRoom({ player_email: this.playerNameCtrl.value!, room_name: roomName });
    }

    public disconnect(): void {
        // @TODO fix roomId
        // @TODO uncomment after email release
        // this.seabattleSocketSrv.disconnectFromRoom(this.authService.user!.email, roomName);
        this.seabattleSocketSrv.disconnectFromRoom('', '');
    }
}
