import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type IconName = 'settings' | '';
@Component({
    selector: 'app-game-menu-button',
    templateUrl: './game-menu-button.component.html',
    styleUrl: './game-menu-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameMenuButtonComponent {
    @Input() text: string = '';

    @Input() iconName: IconName = '';

    public get hasText(): boolean {
        return !!this.text;
    }

    public get hasIcon(): boolean {
        return !!this.iconName;
    }
}
