import { KeysBindings } from '../models/key-bindings-types';

export const DEFAULT_DINO_KEY_BINDINGS: KeysBindings = {
    jump: { value: 'KeyW', friendlyValue: 'w' },
    crawl: { value: 'KeyS', friendlyValue: 's' },
    moveRight: { value: 'KeyD', friendlyValue: 'd' },
    moveLeft: { value: 'KeyA', friendlyValue: 'a' },
    pause_unpause: { value: 'Escape', friendlyValue: 'escape' }
} as const;
