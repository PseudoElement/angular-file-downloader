import { BehaviorSubject, Observable } from 'rxjs';
import { AnimationType, MobileAnimatedObj } from '../models/game-objects-types';
import { ObjectCoords } from '../../../models/game-object-types';

export class Player implements MobileAnimatedObj {
    public readonly _coords$ = new BehaviorSubject<ObjectCoords>({ x: 0, y: 0 });

    public getCoords$(): Observable<{ x: number; y: number }> {
        return this._coords$.asObservable();
    }

    public animate(animation: AnimationType): void {
        throw new Error('Method not implemented.');
    }

    public changeCoordX(): void {
        throw new Error('Method not implemented.');
    }

    public changeCoordY(): void {
        throw new Error('Method not implemented.');
    }
}
