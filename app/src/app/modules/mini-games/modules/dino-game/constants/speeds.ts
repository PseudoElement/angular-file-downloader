import { Difficulty } from '../models/animation-types';

export const CACTUS_SPEED_RATIO: Record<Difficulty, number> = {
    '1': -10,
    '2': -15,
    '3': -18,
    '4': -22,
    '5': -25,
    '6': -27
} as const;
