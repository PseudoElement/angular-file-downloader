import { Difficulty } from '../models/animation-types';

export type ActionType = 'moveLeftSlow' | 'moveRightSlow' | 'moveLeftFast' | 'moveRightFast' | 'moveUp' | 'moveDown' | 'inactive' | 'die';

export interface ActiveObject {
    doAction(action: ActionType): Promise<void>;

    _changeCoordX(deltaX: number): void;

    _changeCoordY(deltaY: number): void;
}
