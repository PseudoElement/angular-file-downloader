import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, iif, Observable, switchMap, tap } from 'rxjs';
import { PlayerPosition, PlayerPositionsMatrix } from '../models/positions';
import { positionsMatrixToString, positionsStringToMatrix } from '../utils/positions-converter';
import { compareObjects } from '../../../utils/compare-objects';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SeaBattlePlayerActionsService } from './sea-battle-player-actions.service';

@Injectable()
export class SeaBattleFieldService {
    private readonly _isChangeModeEnabled$ = new BehaviorSubject<boolean>(false);

    private readonly _playerPositions$ = new BehaviorSubject<PlayerPositionsMatrix>([]);

    private readonly _posiitonsInChangeMode$ = new BehaviorSubject<PlayerPositionsMatrix>([]);

    public readonly isChangeModeEnabled$ = this._isChangeModeEnabled$.asObservable();

    public readonly playerPositions$ = this._isChangeModeEnabled$.asObservable();

    public readonly posiitonsInChangeMode$ = this._isChangeModeEnabled$.asObservable();

    public positionsToShow$(): Observable<PlayerPositionsMatrix> {
        return this._isChangeModeEnabled$.pipe(
            switchMap(() => iif(() => this._isChangeModeEnabled$.value, this._posiitonsInChangeMode$, this._playerPositions$)),
            tap((v) => console.log('positionsToShow$ ===> ', v)),
            distinctUntilChanged()
        );
    }

    constructor(
        private readonly sintolModalSrv: SintolLibDynamicComponentService,
        private readonly sbPlayerActionsSrv: SeaBattlePlayerActionsService
    ) {}

    public async toggleChangeMode(roomId: string): Promise<void> {
        this._isChangeModeEnabled$.next(!this._isChangeModeEnabled$.value);
        const isEnabled = this._isChangeModeEnabled$.value;

        const prevPositions = this._playerPositions$.value;
        const updatedPositions = this._posiitonsInChangeMode$.value;

        if (!isEnabled && !compareObjects(prevPositions, updatedPositions)) {
            const ok = await this.sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
                title: 'Confiramtion',
                text: 'You want to update and save your new positions? You can change it anytime if you need.',
                isConfirmModal: true
            });
            if (!ok) {
                this._posiitonsInChangeMode$.next(prevPositions);
            } else {
                const strPositions = positionsMatrixToString(updatedPositions);
                this.sbPlayerActionsSrv.sendUpdatedPositions(roomId, strPositions);
            }
        }
    }

    public selectCellInChangeMode(selectedCell: PlayerPosition): void {
        const positions = this._posiitonsInChangeMode$.value;

        for (let i = 0; i < positions.length; i++) {
            const rowArray = positions[i];
            for (let j = 0; j < rowArray.length; j++) {
                const cell = rowArray[j];
                console.log('onSelect ==> ', {
                    selectedCell,
                    cell
                });
                if (cell.value === selectedCell.value) {
                    cell.hasShip = true;
                    break;
                }
            }
        }

        this._posiitonsInChangeMode$.next(positions);
    }

    /* string A1+,A2+*,...,J10 */
    public updatePlayerPositions(positions: string): void {
        this._playerPositions$.next(positionsStringToMatrix(positions));
        this._posiitonsInChangeMode$.next(positionsStringToMatrix(positions));
    }
}
