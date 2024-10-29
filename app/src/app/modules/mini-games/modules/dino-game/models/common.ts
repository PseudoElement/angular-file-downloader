import { Difficulty } from './animation-types';

export interface ContainerEnds {
    isLeftEnd: boolean;
    isRightEnd: boolean;
    isTopEnd: boolean;
    isBottomEnd: boolean;
}

export interface DinoGameState {
    time: number;
    difficulty: Difficulty;
    isPlaying: boolean;
    isKilled: boolean;
    gameId: NodeJS.Timeout | null;
}
