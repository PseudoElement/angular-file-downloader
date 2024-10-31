import { BaseGameObject, ImageType } from './base-game-object';

export type ActionType = 'moveLeftSlow' | 'moveRightSlow' | 'moveLeftFast' | 'moveRightFast' | 'moveUp' | 'moveDown' | 'inactive' | 'die';

export type PlayerAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'uncrawl' | 'inactive' | 'inactiveRun' | 'die';

export type CactusAction = 'moveLeft';

export type BirdAction = 'moveLeft';

export type PlayerKeyboardAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'pause_unpause';

export interface MobileObject<T> extends BaseGameObject {
    move(action: T): void;
}

export interface AnimatedObject<T> extends BaseGameObject {
    animate(animation: T): void;
}

export function isMobileObject<T>(obj: BaseGameObject): obj is MobileObject<T> {
    if ('move' in obj) return true;
    return false;
}

export function isAnimatedObject<T>(obj: BaseGameObject): obj is AnimatedObject<T> {
    if ('animate' in obj) return true;
    return false;
}
