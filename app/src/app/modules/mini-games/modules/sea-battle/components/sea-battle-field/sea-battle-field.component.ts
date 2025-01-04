import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-sea-battle-field',
    templateUrl: './sea-battle-field.component.html',
    styleUrl: './sea-battle-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleFieldComponent {}
