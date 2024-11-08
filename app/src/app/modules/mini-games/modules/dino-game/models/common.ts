import { Difficulty } from './animation-types';

export type DelayMs = number;

export type FarmReward = number;

export interface ContainerEnds {
    isLeftEnd: boolean;
    isRightEnd: boolean;
    isTopEnd: boolean;
    isBottomEnd: boolean;
}

export interface DinoGameState {
    time: number;
    difficulty: Difficulty;
    score: number;
    isStarted: boolean;
    isPlaying: boolean;
    isKilled: boolean;
    gameId: NodeJS.Timeout | null;
}
