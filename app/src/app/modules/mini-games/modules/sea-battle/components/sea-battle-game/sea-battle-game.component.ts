import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-sea-battle-game',
    templateUrl: './sea-battle-game.component.html',
    styleUrl: './sea-battle-game.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleGameComponent {}
