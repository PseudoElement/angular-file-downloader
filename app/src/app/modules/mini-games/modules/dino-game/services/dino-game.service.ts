import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { Player } from '../game-objects/player';
import { DinoGameControlsService } from './dino-game-controls.service';

@Injectable()
export class DinoGameService {
    public readonly _difficulty$ = new BehaviorSubject<Difficulty>(1);

    public readonly _isPlaying = new BehaviorSubject(false);

    private player: Player | null = null;

    public get difficulty(): Difficulty {
        return this._difficulty$.value;
    }

    public readonly bgAnimationStyle$ = this._difficulty$.pipe(
        combineLatestWith(this._isPlaying),
        map(([diff, isPlaying]) => (!isPlaying ? 'inactive' : `active-difficulty-${diff}`))
    );

    constructor(private readonly dinoGameControls: DinoGameControlsService) {}

    public async startGame(): Promise<void> {
        this.player = this.spawnPlayer();

        this.dinoGameControls.listenKeyEvents(this.player);
        this.setPlayState(true);
        this._difficulty$.next(1);

        this.player.doAction('inactiveRun');
    }

    public pauseGame(): void {
        this.setPlayState(false);
        this.dinoGameControls.clearListeners();
    }

    public unpauseGame(): void {
        this.setPlayState(true);
        this.dinoGameControls.listenKeyEvents(this.player!);
    }

    public endGame(): void {
        this.setPlayState(false);
        this.dinoGameControls.clearListeners();
        this._difficulty$.next(1);
        this.player = null;
    }

    private spawnPlayer(): Player {
        return new Player({ height: '150px', width: '200px', startX: 50, startY: 390 }, this._difficulty$);
    }

    private setPlayState(isPlaying: boolean): void {
        this._isPlaying.next(isPlaying);
    }

    private raiseDifficulty(): void {
        if (this._difficulty$.value + 1 > 6) return;
        this._difficulty$.next((this._difficulty$.value + 1) as Difficulty);
    }
}
