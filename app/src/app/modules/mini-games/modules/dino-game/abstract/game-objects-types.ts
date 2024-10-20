export type AnimationType =
    | 'moveLeftSlow'
    | 'moveRightSlow'
    | 'moveLeftFast'
    | 'moveRightFast'
    | 'moveUp'
    | 'moveDown'
    | 'inactive'
    | 'die';

export type MobileAnimatedObj = AnimatedObject & MobileObject;

export interface AnimatedObject {
    animate(animation: AnimationType): Promise<void>;
}

export interface MobileObject {
    changeCoordX(): void;

    changeCoordY(): void;
}
