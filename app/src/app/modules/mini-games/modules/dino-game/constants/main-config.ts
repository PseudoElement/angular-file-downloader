import { Difficulty } from '../models/animation-types';
import { DelayMs } from '../models/common';

interface DinoGameData {
    birdSpeed: number;
    cactusSpeed: number;
    playerDeltaX: number;
    playerDeltaY: number;
    spawnDelay: DelayMs;
    nextRoundWhen: DelayMs;
    coinDelay: DelayMs;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DinoGameData> = {
    '1': {
        birdSpeed: -20,
        cactusSpeed: -30,
        playerDeltaX: 50,
        playerDeltaY: 30,
        spawnDelay: 3_000,
        nextRoundWhen: 15_000,
        coinDelay: 3_000
    },
    '2': {
        birdSpeed: -25,
        cactusSpeed: -32,
        playerDeltaX: 50,
        playerDeltaY: 30,
        spawnDelay: 3_000,
        nextRoundWhen: 30_000,
        coinDelay: 3_000
    },
    '3': {
        birdSpeed: -30,
        cactusSpeed: -34,
        playerDeltaX: 55,
        playerDeltaY: 30,
        spawnDelay: 2_500,
        nextRoundWhen: 40_000,
        coinDelay: 3_000
    },
    '4': {
        birdSpeed: -35,
        cactusSpeed: -36,
        playerDeltaX: 55,
        playerDeltaY: 30,
        spawnDelay: 2_500,
        nextRoundWhen: 50_000,
        coinDelay: 3_000
    },
    '5': {
        birdSpeed: -40,
        cactusSpeed: -38,
        playerDeltaX: 60,
        playerDeltaY: 30,
        spawnDelay: 2_000,
        nextRoundWhen: 60_000,
        coinDelay: 3_000
    },
    '6': {
        birdSpeed: -45,
        cactusSpeed: -50,
        playerDeltaX: 60,
        playerDeltaY: 30,
        spawnDelay: 1_500,
        nextRoundWhen: Infinity,
        coinDelay: 3_000
    }
} as const;
