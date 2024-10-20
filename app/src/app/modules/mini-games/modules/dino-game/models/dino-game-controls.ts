export const KEY_NAMES = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
} as const;

export type KeyName = (typeof KEY_NAMES)[keyof typeof KEY_NAMES];
