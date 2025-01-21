import { FIELD_SYMBOLS, POSITION_STATE, PositionState } from '../constants/seabattle-field-data';
import { PlayerPosition, PlayerPositionsMatrix, PlayerPositionsRow } from '../models/positions';

export function positionsStringToMatrix(positions: string): PlayerPositionsMatrix {
    const splitted = positions.split(',').map((val) => val.trim());
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let letterIdx = 0;

    let row = [] as PlayerPositionsRow;
    let matrix = [] as PlayerPositionsMatrix;

    for (let i = 0; i < splitted.length - 1; i++) {
        const cellValue = splitted[i];
        const cellLetter = cellValue.at(0);
        const currLetterRow = letters[letterIdx];

        if (currLetterRow !== cellLetter) {
            letterIdx++;
            matrix.push(row);
            row = [];
        }

        let state: PositionState;
        if (cellValue.includes(FIELD_SYMBOLS.HIT)) {
            state = POSITION_STATE.HIT;
        } else if (cellValue.includes(FIELD_SYMBOLS.MISS)) {
            state = POSITION_STATE.MISS;
        } else {
            state = POSITION_STATE.NOT_CHECKED;
        }

        const rowColumn = cellValue.match(/[A-Z]\d?\d/i)![0];
        const cellObj = {
            hasShip: cellValue.includes(FIELD_SYMBOLS.HAS_SHIP),
            value: rowColumn,
            state
        } satisfies PlayerPosition;

        row.push(cellObj);
    }
    // push last row I in field
    matrix.push(row);

    return matrix;
}

export function positionsMatrixToString(positionsMatrix: PlayerPositionsMatrix): string {
    const posArray = [] as string[];

    for (let i = 0; i < positionsMatrix.length; i++) {
        const rowArray = positionsMatrix[i];
        for (let j = 0; j < rowArray.length; j++) {
            const cell = rowArray[j];
            let strCell = cell.value;

            if (cell.hasShip) strCell += '+';
            if (cell.state === 'HIT') strCell += '*';
            if (cell.state === 'MISS') strCell += '.';

            posArray.push(strCell);
        }
    }

    return posArray.join(',') + ',';
}
