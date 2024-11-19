import { KeysBindings } from 'src/app/modules/mini-games/modules/dino-game/models/key-bindings-types';
import { DinoGameSettings } from 'src/app/modules/mini-games/modules/dino-game/services/dino-game-settings.service';

export interface LocalStorageMap {
    bestTime: number | null;
    bestScore: number | null;
    dinoKeyBindings: KeysBindings | null;
    dinoSettings: DinoGameSettings | null;
}

export type LocalStorageKey = keyof LocalStorageMap;
