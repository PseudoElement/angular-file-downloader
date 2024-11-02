export const GAME_OBJECTS = {
    BIRD: 'BIRD',
    COIN: 'COIN',
    CACTUS: 'CACTUS',
    HEDGEHOG: 'HEDGEHOG',
    PLAYER: 'PLAYER'
} as const;

export type GameObjectType = (typeof GAME_OBJECTS)[keyof typeof GAME_OBJECTS];
