import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-menu-button',
    templateUrl: './game-menu-button.component.html',
    styleUrl: './game-menu-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameMenuButtonComponent {
    @Input({ required: true }) text: string = '';
}
