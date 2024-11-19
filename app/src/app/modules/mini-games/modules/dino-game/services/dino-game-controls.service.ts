import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerKeyboardAction } from '../models/game-objects-types';

export type KeysMap = {
    [key in PlayerKeyboardAction]: { value: string; friendlyValue: string };
};

@Injectable()
export class DinoGameControlsService {
    private readonly _keyBindings$ = new BehaviorSubject<KeysMap>({
        jump: { value: 'KeyW', friendlyValue: 'w' },
        crawl: { value: 'KeyS', friendlyValue: 's' },
        moveRight: { value: 'KeyD', friendlyValue: 'd' },
        moveLeft: { value: 'KeyA', friendlyValue: 'a' },
        pause_unpause: { value: 'Escape', friendlyValue: 'esc' }
    });

    public readonly keyBindings$ = this._keyBindings$.asObservable();

    public get keyBindings(): KeysMap {
        return this._keyBindings$.value;
    }

    constructor() {}

    public changeKeyBindings(newKeyBindings: KeysMap): void {
        this._keyBindings$.next(newKeyBindings);
    }
}
