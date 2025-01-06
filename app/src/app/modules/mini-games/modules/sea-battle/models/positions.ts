import { PositionState } from '../constants/seabattle-field-data';

export type PlayerPositionsMatrix = PlayerPositionsRow[];

export type PlayerPositionsRow = PlayerPosition[];

export interface PlayerPosition {
    value: string;
    hasShip: boolean;
    state: PositionState;
}
