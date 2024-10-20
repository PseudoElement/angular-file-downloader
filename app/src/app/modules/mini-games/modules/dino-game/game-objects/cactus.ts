import { Observable } from 'rxjs';
import { AnimationType, MobileObject } from '../abstract/game-objects-types';

export class Cactus implements MobileObject {
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
