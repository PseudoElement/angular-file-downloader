import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerPosition, PlayerPositionsMatrix } from '../../models/positions';
import { SeaBattleFieldService } from '../../services/sea-battle-field.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, iif, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-sea-battle-field',
    templateUrl: './sea-battle-field.component.html',
    styleUrl: './sea-battle-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeaBattleFieldComponent {
    public positionsToShow: PlayerPositionsMatrix = [];

    @Input() isEnemyField!: boolean;

    @Input() set positionsString(val: string) {
        if (this.isEnemyField) {
            this.sbFieldSrv.updateEnemyPositions(val);
        } else {
            this.sbFieldSrv.updateYourPositions(val);
        }
    }

    @Input() isChangeMode: boolean = false;

    @Output() cellSelected: EventEmitter<PlayerPosition> = new EventEmitter();

    @Output() positionsUpdated: EventEmitter<PlayerPositionsMatrix> = new EventEmitter();

    constructor(private readonly sbFieldSrv: SeaBattleFieldService, private readonly cdr: ChangeDetectorRef) {
        this.sbFieldSrv.isChangeModeEnabled$
            .pipe(
                switchMap((enabled) =>
                    iif(
                        () => this.isEnemyField,
                        this.sbFieldSrv.enemyPositions$,
                        enabled ? this.sbFieldSrv.posiitonsInChangeMode$ : this.sbFieldSrv.yourPositions$
                    )
                ),
                distinctUntilChanged()
            )
            .subscribe((positions) => {
                this.positionsToShow = positions;
                this.cdr.markForCheck();
            });
    }

    public onCellSelect(cell: PlayerPosition): void {
        if (!this.isChangeMode) return;
        if (this.isEnemyField) this.cellSelected.emit(cell);
        else this.sbFieldSrv.selectCellInChangeMode(cell);
    }
}
