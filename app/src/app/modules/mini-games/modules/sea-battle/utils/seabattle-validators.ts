import { ShipSize } from '../constants/seabattle-field-data';
import { CellsIterator } from '../entities/cells-iterator';
import { PlayerPosition, PlayerPositionsMatrix } from '../models/positions';

function validateCellsWithShip(
    cellsWithShip: PlayerPosition[],
    shipsOnField: Record<ShipSize, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    }
): { valid: boolean } {
    if (!cellsWithShip.length) {
        if (shipsOnField[1] === 4 && shipsOnField[2] === 3 && shipsOnField[3] === 2 && shipsOnField[4] === 1) {
            return { valid: true };
        }
        return { valid: false };
    }

    const targetCell = cellsWithShip[0];
    const cellsIterator = new CellsIterator(targetCell, cellsWithShip);

    while (!cellsIterator.doneRow) cellsIterator.nextRow();
    while (!cellsIterator.doneColumn) cellsIterator.nextColumn();

    if (cellsIterator.shipSize() > 4) return { valid: false };

    shipsOnField[cellsIterator.shipSize()] += 1;
    cellsWithShip = cellsIterator.returnUpdatedPositions(cellsWithShip);

    return validateCellsWithShip(cellsWithShip, shipsOnField);
}

export function isValidSelectedShips(positions: PlayerPositionsMatrix): boolean {
    let cellsWithShip = positions.flat().filter((cell) => cell.hasShip);

    const { valid } = validateCellsWithShip(cellsWithShip);

    return valid;
}
