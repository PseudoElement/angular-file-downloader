import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-info-element',
    templateUrl: './game-info-element.component.html',
    styleUrl: './game-info-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameInfoElementComponent {
    @Input({ required: true }) value: string | number = '';

    @Input({ required: true }) name: string = '';
}
