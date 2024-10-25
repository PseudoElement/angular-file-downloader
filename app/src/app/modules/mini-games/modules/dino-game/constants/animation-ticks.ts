import { PlayerAction } from '../abstract/game-objects-types';
import { Difficulty, PlayerAnimation } from '../models/animation-types';

type TimeMs = number;

// export const ANIMATION_TICKS: Record<Difficulty, TimeMs> = {
//     1: 35_000,
//     2: 60_000,
//     3: 75_000,
//     4: 80_000,
//     5: 90_000,
//     6: Infinity
// };

export const ANIMATION_TICKS: Record<Difficulty, TimeMs> = {
    1: 10_500,
    2: 9_000,
    3: 7_500,
    4: 20_000,
    5: 15_000,
    6: Infinity
};

export const ANIMATION_PER_ACTION: Record<PlayerAction, PlayerAnimation> = {
    inactive: 'inactive',
    die: 'inactive',
    inactiveRun: 'move',
    crawl: 'move',
    uncrawl: 'move',
    moveLeft: 'move',
    moveRight: 'move',
    jump: 'move'
} as const;
