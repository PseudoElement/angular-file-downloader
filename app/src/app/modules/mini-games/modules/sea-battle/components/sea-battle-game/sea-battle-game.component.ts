import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SeaBattleApiService } from '../../services/sea-battle-api.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-sea-battle-game',
    templateUrl: './sea-battle-game.component.html',
    styleUrl: './sea-battle-game.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleGameComponent {
    public readonly roomNameCtrl = new FormControl<string>('');

    public readonly playerNameCtrl = new FormControl<string>('');

    public readonly stepCtrl = new FormControl<string>('');

    constructor(private readonly seabattleApiSrv: SeaBattleApiService) {}

    public createRoom(): void {
        this.seabattleApiSrv.createRoom({ player_email: this.playerNameCtrl.value!, room_name: this.roomNameCtrl.value! });
    }

    public connect(): void {
        this.seabattleApiSrv.connectToRoom({ player_email: this.playerNameCtrl.value!, room_name: this.roomNameCtrl.value! });
    }

    public disconnect(): void {
        this.seabattleApiSrv.disconnectFromRoom({ player_email: this.playerNameCtrl.value!, room_name: this.roomNameCtrl.value! });
    }
}
