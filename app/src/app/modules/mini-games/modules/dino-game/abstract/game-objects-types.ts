import { Observable } from 'rxjs';
import { ObjectCoords } from '../../../models/game-object-types';

export type ActionType = 'moveLeftSlow' | 'moveRightSlow' | 'moveLeftFast' | 'moveRightFast' | 'moveUp' | 'moveDown' | 'inactive' | 'die';

export type PlayerAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'uncrawl' | 'inactive' | 'inactiveRun' | 'die';

export type PlayerKeyboardAction = Extract<PlayerAction, 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'inactive'>;

export interface ActiveObject<T> {
    doAction(action: T): void;

    getCoords$(): Observable<ObjectCoords>;

    _changeCoordX(deltaX: number): void;

    _changeCoordY(deltaY: number): void;
}
