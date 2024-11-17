import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerKeyboardAction } from '../models/game-objects-types';

export type KeysMap = {
    [key in PlayerKeyboardAction]: string;
};

@Injectable()
export class DinoGameControlsService {
    private readonly _keyBindings$ = new BehaviorSubject<KeysMap>({
        jump: 'KeyW',
        crawl: 'KeyS',
        moveRight: 'KeyD',
        moveLeft: 'KeyA',
        pause_unpause: 'Escape'
    });

    public readonly keyBindings$ = this._keyBindings$.asObservable();

    public get keyBindings(): KeysMap {
        return this._keyBindings$.value;
    }

    constructor() {}

    public changeKeyBinding(action: PlayerKeyboardAction, keyCode: string): void {
        this._keyBindings$.next({ ...this._keyBindings$.value, [action]: keyCode });
    }
}
