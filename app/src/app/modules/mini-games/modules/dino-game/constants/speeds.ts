import { Difficulty } from '../models/animation-types';

export const CACTUS_SPEED_RATIO: Record<Difficulty, number> = {
    '1': -20,
    '2': -22,
    '3': -24,
    '4': -26,
    '5': -28,
    '6': -30
} as const;
