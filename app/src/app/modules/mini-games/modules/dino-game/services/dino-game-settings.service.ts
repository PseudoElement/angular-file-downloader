import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerKeyboardAction } from '../models/game-objects-types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeysBindings } from '../models/key-bindings-types';
import { DEFAULT_DINO_KEY_BINDINGS } from '../constants/key-bindings';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

export interface DinoGameSettings {
    isMuted: boolean;
}

@Injectable()
export class DinoGameSettingsService {
    private readonly _keyBindings$ = new BehaviorSubject<KeysBindings>(DEFAULT_DINO_KEY_BINDINGS);

    private readonly _settings$ = new BehaviorSubject<DinoGameSettings>({ isMuted: false });

    public readonly settings$ = this._settings$.asObservable();

    public get settings(): DinoGameSettings {
        return this._settings$.value;
    }

    public readonly keyBindings$ = this._keyBindings$.asObservable();

    public get keyBindings(): KeysBindings {
        return this._keyBindings$.value;
    }

    constructor(private readonly localStorageSrv: LocalStorageService) {
        this.init();
    }

    public changeGameSettings(settings: Partial<DinoGameSettings>): void {
        const newSettings = { ...settings, ...('isMuted' in settings && { isMuted: settings.isMuted }) } as DinoGameSettings;

        this._settings$.next(newSettings);
        this.localStorageSrv.set('dinoSettings', newSettings);
    }

    public changeKeyBindings(newKeyBindings: KeysBindings): void {
        this._keyBindings$.next(newKeyBindings);
        this.localStorageSrv.set('dinoKeyBindings', newKeyBindings);
    }

    private init(): void {
        const storedKeyBindings = this.localStorageSrv.storageState.dinoKeyBindings;
        const storedSettings = this.localStorageSrv.storageState.dinoSettings;

        this.changeKeyBindings(storedKeyBindings ?? DEFAULT_DINO_KEY_BINDINGS);
        this.changeGameSettings(storedSettings ?? {});
    }
}
