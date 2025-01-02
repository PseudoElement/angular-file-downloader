import { Injectable } from '@angular/core';
import { LocalStorageKey, LocalStorageMap } from './model';
import { BehaviorSubject } from 'rxjs';
import { KeysBindings } from 'src/app/modules/mini-games/modules/dino-game/models/key-bindings-types';
import { DinoGameSettings } from 'src/app/modules/mini-games/modules/dino-game/services/dino-game-settings.service';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private readonly _storageState$ = new BehaviorSubject<LocalStorageMap>({
        bestScore: null,
        bestTime: null,
        dinoKeyBindings: null,
        dinoSettings: null
    });

    public readonly storageState$ = this._storageState$.asObservable();

    public get storageState(): LocalStorageMap {
        return this._storageState$.value;
    }

    constructor() {
        const bestScore = this.get('bestScore');
        const bestTime = this.get('bestTime');
        const dinoKeyBindings = this.get<KeysBindings>('dinoKeyBindings');
        const dinoSettings = this.get<DinoGameSettings>('dinoSettings');

        this._storageState$.next({
            bestScore: bestScore ? Number(bestScore) : null,
            bestTime: bestTime ? Number(bestTime) : null,
            dinoKeyBindings: dinoKeyBindings ? dinoKeyBindings : null,
            dinoSettings: dinoSettings ? dinoSettings : null
        });
    }

    public get<T = string>(key: LocalStorageKey): T | null {
        const value = localStorage.getItem(key) ?? null;
        if (!value) return null;

        return JSON.parse(value);
    }

    public set<T extends LocalStorageMap, K extends LocalStorageKey>(key: K, value: T[K]): void {
        localStorage.setItem(key as string, JSON.stringify(value));
        this._storageState$.next({
            ...this._storageState$.value,
            [key]: value
        });
    }
}
