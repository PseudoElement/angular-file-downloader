import { Observable } from 'rxjs';
import { ObjectCoords } from '../../../models/game-object-types';
import { ActionType, ActiveObject } from '../abstract/game-objects-types';

export class Bird implements ActiveObject<any> {
    getCoords$(): Observable<ObjectCoords> {
        throw new Error('Method not implemented.');
    }
    doAction(action: ActionType): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
