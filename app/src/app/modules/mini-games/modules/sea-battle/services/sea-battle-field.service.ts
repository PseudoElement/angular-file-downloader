import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, iif, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { PlayerPosition, PlayerPositionsMatrix } from '../models/positions';
import { positionsMatrixToString, positionsStringToMatrix } from '../utils/positions-converter';
import { compareObjects } from '../../../utils/compare-objects';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SeaBattleSocketService } from './sea-battle-socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsService } from 'src/app/shared/services/alerts.service';
import { CLEAR_SEABATTLE_FIELD } from '../constants/seabattle-consts';
import { isValidSelectedShips } from '../utils/seabattle-validators';

@Injectable()
export class SeaBattleFieldService {
    private readonly _isChangeModeEnabled$ = new BehaviorSubject<boolean>(false);

    private readonly _yourPositions$ = new BehaviorSubject<PlayerPositionsMatrix>([]);

    private readonly _enemyPositions$ = new BehaviorSubject<PlayerPositionsMatrix>([]);

    private readonly _posiitonsInChangeMode$ = new BehaviorSubject<PlayerPositionsMatrix>([]);

    private readonly _canSendUpdatedPositions$ = new BehaviorSubject<boolean>(false);

    public readonly isChangeModeEnabled$ = this._isChangeModeEnabled$.asObservable();

    public readonly yourPositions$ = this._yourPositions$.asObservable();

    public readonly enemyPositions$ = this._enemyPositions$.asObservable();

    public readonly posiitonsInChangeMode$ = this._posiitonsInChangeMode$.asObservable();

    public get canSendUpdatedPositions(): boolean {
        return this._canSendUpdatedPositions$.value;
    }

    public get yourPositionsStr(): string {
        return positionsMatrixToString(this._yourPositions$.value);
    }

    constructor(private readonly sintolModalSrv: SintolLibDynamicComponentService, private readonly alertsSrv: AlertsService) {
        this.isChangeModeEnabled$
            .pipe(
                filter((enabled) => Boolean(enabled)),
                takeUntilDestroyed()
            )
            .subscribe(() =>
                this.alertsSrv.showAlert({
                    text: `You enabled "Change Mode". Click on cell on your field to add/remove your ship. Your field needs contain:
4 single-cell ships, 3 two-cells ships, 2 three-cells ships, 1 four-cells ship. Between ships should be at least 1 empty cell.
After you've selected all neccessary fields - Click on "Disable change mode" and click "OK". Then click to "Confirm" button to save your positions on server.`,
                    type: 'info',
                    closeDelay: 30_000
                })
            );
    }

    public async toggleChangeMode(roomId: string): Promise<void> {
        const isEnabled = !this._isChangeModeEnabled$.value;

        const prevPositions = this._yourPositions$.value;
        const updatedPositions = this._posiitonsInChangeMode$.value;

        if (!isEnabled && !compareObjects(prevPositions, updatedPositions)) {
            const ok = await this.sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
                title: 'Confiramtion',
                text: 'You want to update and save your new positions? You can change it anytime if you need.',
                isConfirmModal: true
            });

            if (!ok) {
                this._posiitonsInChangeMode$.next(positionsStringToMatrix(CLEAR_SEABATTLE_FIELD));
                this._isChangeModeEnabled$.next(false);
                return;
            }

            if (isValidSelectedShips(updatedPositions)) {
                const strPositions = positionsMatrixToString(updatedPositions);
                this.updateYourPositions(strPositions);
                this._posiitonsInChangeMode$.next(positionsStringToMatrix(CLEAR_SEABATTLE_FIELD));
                this.setCanSendUpdatedPositions(true);
                this._isChangeModeEnabled$.next(false);
            } else {
                this.alertsSrv.showAlert({ text: "Selected cells aren't according to game rules.", type: 'warn' });
            }
        }
    }

    public selectCellInChangeMode(selectedCell: PlayerPosition): void {
        const positions = this._posiitonsInChangeMode$.value;

        for (let i = 0; i < positions.length; i++) {
            const rowArray = positions[i];
            for (let j = 0; j < rowArray.length; j++) {
                const cell = rowArray[j];
                if (cell.value === selectedCell.value) {
                    cell.hasShip = !cell.hasShip;
                    break;
                }
            }
        }

        this._posiitonsInChangeMode$.next(positions);
    }

    /* string A1+,A2+*,...,J10 */
    public updateYourPositions(positions: string): void {
        this._yourPositions$.next(positionsStringToMatrix(positions));
        this._posiitonsInChangeMode$.next(positionsStringToMatrix(positions));
    }

    public updateEnemyPositions(positions: string): void {
        this._enemyPositions$.next(positionsStringToMatrix(positions));
    }

    public setCanSendUpdatedPositions(canSend: boolean): void {
        this._canSendUpdatedPositions$.next(canSend);
    }
}
