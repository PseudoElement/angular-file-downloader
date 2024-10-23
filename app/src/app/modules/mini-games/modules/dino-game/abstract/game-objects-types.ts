import { BaseGameObject } from './base-game-object';

export type ActionType = 'moveLeftSlow' | 'moveRightSlow' | 'moveLeftFast' | 'moveRightFast' | 'moveUp' | 'moveDown' | 'inactive' | 'die';

export type PlayerAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'uncrawl' | 'inactive' | 'inactiveRun' | 'die';

export type CactusAction = 'moveLeft';

export type PlayerKeyboardAction = Extract<PlayerAction, 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'inactive'>;

export interface ActiveObject<T> {
    doAction(action: T): void;
}

export interface MobileObject<T> extends BaseGameObject {
    move(action: T): void;
}
