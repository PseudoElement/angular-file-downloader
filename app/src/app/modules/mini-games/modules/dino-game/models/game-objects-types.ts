import { Observable } from 'rxjs';

export type AnimationType = 'moveLeft' | 'moveRight' | 'moveUp' | 'moveDown' | 'inactive';

export type MobileAnimatedObj = AnimatedObject & MobileObject;

export interface AnimatedObject {
    animate(animation: AnimationType): void;
}

export interface MobileObject {
    getCoords$(): Observable<{ x: number; y: number }>;

    changeCoordX(): void;

    changeCoordY(): void;
}
