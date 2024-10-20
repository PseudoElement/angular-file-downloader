import { ActionType, ActiveObject } from '../abstract/game-objects-types';

export class Cactus implements ActiveObject {
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
