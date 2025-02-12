import { ShipSize } from '../constants/seabattle-field-data';
import { PlayerPositionsMatrix } from '../models/positions';

function isCorrectShipsCount(ships: Array<number[][]>): boolean {
    const shipsOnField: Record<ShipSize, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    };
    for (const ship of ships) {
        const shipSize = ship.length;
        shipsOnField[shipSize] += 1;
    }

    if (shipsOnField[1] === 4 && shipsOnField[2] === 3 && shipsOnField[3] === 2 && shipsOnField[4] === 1) {
        return true;
    }

    return false;
}

export function isValidSelectedShips(matrix: PlayerPositionsMatrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const visited = new Set();
    const ships = [] as Array<number[][]>;

    function dfs(x: number, y: number, ship: number[][]) {
        if (x < 0 || x >= rows || y < 0 || y >= cols || visited.has(`${x},${y}`) || !matrix[x][y].hasShip) {
            return;
        }
        visited.add(`${x},${y}`);
        ship.push([x, y]);
        dfs(x + 1, y, ship); // Down
        dfs(x - 1, y, ship); // Up
        dfs(x, y + 1, ship); // Right
        dfs(x, y - 1, ship); // Left
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j].hasShip && !visited.has(`${i},${j}`)) {
                const ship = [] as any[];
                dfs(i, j, ship);
                ships.push(ship);
            }
        }
    }

    // checks invalid ship sizes
    if (ships.some((ship) => ship.length > 4 || ship.length < 1)) return false;
    if (!isCorrectShipsCount(ships)) return false;

    for (const ship of ships) {
        const surroundingCells = new Set();
        for (const [x, y] of ship) {
            for (const [dx, dy] of [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 1],
                [1, -1],
                [1, 0],
                [1, 1]
            ]) {
                const ni = x + dx;
                const nj = y + dy;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !matrix[ni][nj].hasShip) {
                    surroundingCells.add(`${ni},${nj}`);
                }
            }
        }
        if (surroundingCells.size < ship.length) {
            return false; // Not enough surrounding empty space
        }
    }

    return true;
}
