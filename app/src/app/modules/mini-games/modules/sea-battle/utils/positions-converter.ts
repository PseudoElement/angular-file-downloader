import { FIELD_SYMBOLS, POSITION_STATE } from '../constants/seabattle-field-data';
import { PlayerPosition, PlayerPositionsMatrix, PlayerPositionsRow } from '../models/positions';

export function positionsToMatrix(positions: string): PlayerPositionsMatrix {
    const splitted = positions.split(',').map((val) => val.trim());
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let letterIdx = 0;

    let row = [] as PlayerPositionsRow;
    let matrix = [] as PlayerPositionsMatrix;

    for (let i = 0; i < splitted.length; i++) {
        const cellValue = splitted[i];
        const cellLetter = cellValue.at(0);
        const currLetterRow = letters[letterIdx];

        if (currLetterRow !== cellLetter) {
            letterIdx++;
            matrix.push(row);
            row = [];
        }

        // return A1 from A1+*
        const rowColumn = cellValue.match(/[A-Za-z]\d?\d/i)![0];
        const state = cellValue.includes(FIELD_SYMBOLS.HIT)
            ? POSITION_STATE.HIT
            : cellValue.includes(FIELD_SYMBOLS.MISS)
            ? POSITION_STATE.MISS
            : POSITION_STATE.NOT_CHECKED;

        const cellObj = {
            hasShip: cellValue.includes(FIELD_SYMBOLS.HAS_SHIP),
            value: rowColumn,
            state
        } satisfies PlayerPosition;

        row.push(cellObj);
    }

    return matrix;
}
