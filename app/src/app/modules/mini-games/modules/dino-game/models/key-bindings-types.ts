import { PlayerKeyboardAction } from './game-objects-types';

export type KeysBindings = {
    [key in PlayerKeyboardAction]: { value: string; friendlyValue: string };
};
