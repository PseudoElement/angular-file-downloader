import { Observable } from 'rxjs';
import { AnimationType, MobileAnimatedObj } from '../abstract/game-objects-types';

export class Bird implements MobileAnimatedObj {
    animate(animation: AnimationType): void {
        throw new Error('Method not implemented.');
    }
    getCoords$(): Observable<{ x: number; y: number }> {
        throw new Error('Method not implemented.');
    }
    changeCoordX(): void {
        throw new Error('Method not implemented.');
    }
    changeCoordY(): void {
        throw new Error('Method not implemented.');
    }
}
