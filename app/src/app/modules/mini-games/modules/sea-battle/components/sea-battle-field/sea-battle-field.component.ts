import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerPosition, PlayerPositionsMatrix } from '../../models/positions';
import { SeaBattleFieldService } from '../../services/sea-battle-field.service';

@Component({
    selector: 'app-sea-battle-field',
    templateUrl: './sea-battle-field.component.html',
    styleUrl: './sea-battle-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleFieldComponent {
    @Input() set positionsString(val: string) {
        this.sbFieldSrv.updatePlayerPositions(val);
    }

    @Input() isEnemyField!: boolean;

    @Input() isChangeMode: boolean = false;

    @Output() cellSelected: EventEmitter<PlayerPosition> = new EventEmitter();

    @Output() positionsUpdated: EventEmitter<PlayerPositionsMatrix> = new EventEmitter();

    public readonly positionsToShow$ = this.sbFieldSrv.positionsToShow$();

    constructor(private readonly sbFieldSrv: SeaBattleFieldService) {}

    public onCellSelect(cell: PlayerPosition): void {
        if (this.isChangeMode) {
            this.sbFieldSrv.selectCellInChangeMode(cell);
        } else {
            this.cellSelected.emit(cell);
        }
    }
}
