import { Difficulty } from '../models/animation-types';
import { DelayMs } from '../models/common';

interface DinoGameData {
    birdSpeed: number;
    cactusSpeed: number;
    playerDeltaX: number;
    playerDeltaY: number;
    spawnDelay: DelayMs;
    nextRoundWhen: DelayMs;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DinoGameData> = {
    '1': {
        birdSpeed: -20,
        cactusSpeed: -30,
        playerDeltaX: 50,
        playerDeltaY: 30,
        spawnDelay: 3_000,
        nextRoundWhen: 10_000
    },
    '2': {
        birdSpeed: -25,
        cactusSpeed: -32,
        playerDeltaX: 50,
        playerDeltaY: 30,
        spawnDelay: 2_900,
        nextRoundWhen: 20_000
    },
    '3': {
        birdSpeed: -30,
        cactusSpeed: -34,
        playerDeltaX: 55,
        playerDeltaY: 30,
        spawnDelay: 2_800,
        nextRoundWhen: 30_000
    },
    '4': {
        birdSpeed: -35,
        cactusSpeed: -36,
        playerDeltaX: 55,
        playerDeltaY: 30,
        spawnDelay: 2_750,
        nextRoundWhen: 40_000
    },
    '5': {
        birdSpeed: -40,
        cactusSpeed: -38,
        playerDeltaX: 60,
        playerDeltaY: 30,
        spawnDelay: 2_700,
        nextRoundWhen: 50_000
    },
    '6': {
        birdSpeed: -45,
        cactusSpeed: -50,
        playerDeltaX: 60,
        playerDeltaY: 30,
        spawnDelay: 1_900,
        nextRoundWhen: Infinity
    }
} as const;
