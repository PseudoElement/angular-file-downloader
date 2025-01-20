import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerPositionsMatrix } from '../../models/positions';
import { positionsToMatrix } from '../../utils/positions-converter';

@Component({
    selector: 'app-sea-battle-field',
    templateUrl: './sea-battle-field.component.html',
    styleUrl: './sea-battle-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleFieldComponent {
    @Input() set positionsString(val: string) {
        const matrix = positionsToMatrix(val);
        this.positionsMatrix$.next(matrix);
    }

    @Input() isEnemyField!: boolean;

    public readonly positionsMatrix$ = new BehaviorSubject<PlayerPositionsMatrix>([]);
}
