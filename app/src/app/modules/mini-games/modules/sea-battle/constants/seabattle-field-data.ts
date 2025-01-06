export const POSITION_STATE = {
    HIT: 'HIT',
    MISS: 'MISS',
    NOT_CHECKED: 'NOT_CHECKED'
} as const;

export type PositionState = (typeof POSITION_STATE)[keyof typeof POSITION_STATE];

export const FIELD_SYMBOLS = {
    HIT: '*',
    HAS_SHIP: '+',
    MISS: '.'
} as const;

export type FieldSymbol = (typeof FIELD_SYMBOLS)[keyof typeof FIELD_SYMBOLS];
