import { Observable } from 'rxjs';
import { ObjectCoords } from '../../../models/game-object-types';
import { ActionType, ActiveObject } from '../abstract/game-objects-types';

export class Cactus implements ActiveObject<any> {
    getCoords$(): Observable<ObjectCoords> {
        throw new Error('Method not implemented.');
    }
    doAction(action: ActionType): Promise<void> {
        throw new Error('Method not implemented.');
    }
    _changeCoordX(): void {
        throw new Error('Method not implemented.');
    }
    _changeCoordY(): void {
        throw new Error('Method not implemented.');
    }
}
