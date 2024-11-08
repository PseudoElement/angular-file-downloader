import { BaseGameObject } from '../abstract/base-game-object';
import { FarmReward } from './common';

export type ActionType = 'moveLeftSlow' | 'moveRightSlow' | 'moveLeftFast' | 'moveRightFast' | 'moveUp' | 'moveDown' | 'inactive' | 'die';

export type PlayerAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'uncrawl' | 'inactive' | 'inactiveRun' | 'die';

export type CactusAction = 'moveLeft';

export type BirdAction = 'moveLeft';

export type CoinAction = 'moveLeft';

export type PlayerKeyboardAction = 'jump' | 'moveRight' | 'moveLeft' | 'crawl' | 'pause_unpause';

export interface MobileObject<T = any> extends BaseGameObject {
    move(action?: T): void;
}

export interface AnimatedObject<T = any> extends BaseGameObject {
    animate(animation?: T): void;
}

export interface Farmable extends BaseGameObject {
    get price(): FarmReward;
    beGrabbed(): FarmReward;
}

export function isMobileObject<T = any>(obj: BaseGameObject): obj is MobileObject<T> {
    if ('move' in obj) return true;
    return false;
}

export function isAnimatedObject<T = any>(obj: BaseGameObject): obj is AnimatedObject<T> {
    if ('animate' in obj) return true;
    return false;
}

export function isFarmableObject(obj: BaseGameObject): obj is Farmable {
    if ('beGrabbed' in obj) return true;
    return false;
}

export function assertObjectFarmable(obj: BaseGameObject): asserts obj is Farmable {
    if (!isFarmableObject(obj)) throw new Error('Object is not farmable!!!');
}
