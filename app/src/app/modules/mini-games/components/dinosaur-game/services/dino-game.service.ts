import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { wait } from 'src/app/utils/wait';
import { ANIMATION_TICKS } from '../constants/animation-ticks';

/**   left: line1.length * imgWidth;
 * 1. line1(left: 0) - line2(left: line1.length * imgWidth)
 *  When Math
 * 2.
 * 3.
 * 4.
 *
 * */

@Injectable()
export class DinoGameService {
    public readonly _difficulty$ = new BehaviorSubject<Difficulty>(1);

    public readonly _isPlaying = new BehaviorSubject(false);

    public get difficulty(): Difficulty {
        return this._difficulty$.value;
    }

    public readonly bgAnimationStyle$ = this._difficulty$.pipe(
        combineLatestWith(this._isPlaying),
        map(([diff, isPlaying]) => (!isPlaying ? 'inactive' : `active-difficulty-${diff}`))
    );

    constructor() {}

    public async startGame(): Promise<void> {
        this.setPlayState(true);
        this._difficulty$.next(1);

        while (this.difficulty < 6) {
            await wait(ANIMATION_TICKS[this.difficulty]);
            this.raiseDifficulty();
        }
    }

    public pauseGame(): void {
        this.setPlayState(false);
    }

    public unpauseGame(): void {
        this.setPlayState(true);
    }

    public endGame(): void {
        this.setPlayState(false);
        this._difficulty$.next(1);
    }

    private setPlayState(isPlaying: boolean): void {
        this._isPlaying.next(isPlaying);
    }

    private raiseDifficulty(): void {
        if (this._difficulty$.value + 1 > 6) return;
        this._difficulty$.next((this._difficulty$.value + 1) as Difficulty);
    }
}
