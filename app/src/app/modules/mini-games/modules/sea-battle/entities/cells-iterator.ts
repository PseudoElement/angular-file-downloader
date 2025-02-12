import { ROWS } from '../constants/seabattle-consts';
import { PlayerPosition } from '../models/positions';

export class CellsIterator {
    private readonly startCell: PlayerPosition;

    private currentRowCell: PlayerPosition;

    private currentColumnCell: PlayerPosition;

    private _doneRow: boolean;

    private _doneColumn: boolean;

    private size: number;

    private checkedPositions: PlayerPosition[] = [];

    public get doneRow(): boolean {
        return this._doneRow;
    }

    public get doneColumn(): boolean {
        return this._doneColumn;
    }

    constructor(cell: PlayerPosition, private readonly cellsWithShip: PlayerPosition[]) {
        this.startCell = cell;
        this.currentRowCell = { ...cell };
        this.currentColumnCell = { ...cell };
        this.checkedPositions.push(this.startCell);

        this._doneRow = false;
        this._doneColumn = false;
        this.size = 1;
    }

    public nextRow(): void {
        const rowLetter = this.currentRowCell.value[0];
        const columnNum = this.currentRowCell.value.slice(1);

        const nextRowLetterIdx = ROWS.findIndex((letter) => letter === rowLetter) + 1;
        if (nextRowLetterIdx > 9) {
            this._doneRow = true;
            return;
        }

        const nextRowLetter = ROWS[nextRowLetterIdx];
        const nextCellInRowValue = nextRowLetter + columnNum;

        const foundCellWithShip = this.cellsWithShip.find((cell) => cell.value === nextCellInRowValue);
        if (!foundCellWithShip) {
            this._doneRow = true;
            return;
        }

        this.checkedPositions.push(foundCellWithShip);
        this.size++;
        this.currentRowCell = foundCellWithShip;
    }

    public nextColumn(): void {
        const rowLetter = this.currentColumnCell.value[0];
        const columnNum = this.currentColumnCell.value.slice(1);

        const nextColumnNum = parseInt(columnNum) + 1;
        if (nextColumnNum > 10) {
            this._doneColumn = true;
            return;
        }

        const nextCellInColumnValue = rowLetter + nextColumnNum;
        const foundCellWithShip = this.cellsWithShip.find((cell) => cell.value === nextCellInColumnValue);
        if (!foundCellWithShip) {
            this._doneColumn = true;
            return;
        }

        this.checkedPositions.push(foundCellWithShip);
        this.size++;
        this.currentColumnCell = foundCellWithShip;
    }

    public shipSize(): number {
        return this.size;
    }

    /**
     * @returns filtered positions without already checked
     */
    public returnUpdatedPositions(startPositions: PlayerPosition[]): PlayerPosition[] {
        return startPositions.filter((pos) => !this.checkedPositions.some((p) => p.value === pos.value));
    }
}
