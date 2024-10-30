import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DelayMs, DinoGameState } from '../models/common';
import { Difficulty } from '../models/animation-types';
import { BaseGameObject } from '../abstract/base-game-object';
import { Player } from '../game-objects/player';

@Injectable()
export class DinoGameStateService {
    public readonly gameState$ = new BehaviorSubject<DinoGameState>({
        time: 0,
        difficulty: 1,
        isPlaying: false,
        isKilled: false,
        gameId: null
    });

    private readonly _player$ = new BehaviorSubject<Player | null>(null);

    public readonly player$ = this._player$.asObservable();

    private readonly _gameObjects$ = new BehaviorSubject<BaseGameObject[]>([]);

    public readonly gameObjects$ = this._gameObjects$.asObservable();

    public get difficulty(): Difficulty {
        return this.gameState$.value.difficulty;
    }

    public get time(): DelayMs {
        return this.gameState$.value.time;
    }

    public get player(): Player | null {
        return this._player$.value;
    }

    public get gameObjects(): BaseGameObject[] {
        return this._gameObjects$.value;
    }

    public get gameId(): NodeJS.Timeout | null {
        return this.gameState$.value.gameId;
    }

    public get isPlaying(): boolean {
        return this.gameState$.value.isPlaying;
    }

    constructor() {}

    public changeGameState(state: Partial<DinoGameState>): void {
        if ('gameId' in state && state.gameId === null) {
            clearInterval(this.gameId!);
        }

        const newState = {
            ...this.gameState$.value,
            ...(state.difficulty && { difficulty: state.difficulty }),
            ...('isPlaying' in state && { isPlaying: state.isPlaying }),
            ...(state.time && { time: state.time }),
            ...(state.gameId && { gameId: state.gameId })
        } as DinoGameState;

        this.gameState$.next(newState);
    }

    public setPlayer(player: Player | null): void {
        this._player$.next(player);
    }

    public addGameObject(obj: BaseGameObject): void {
        this.gameObjects.push(obj);
        this._gameObjects$.next(this.gameObjects);
    }

    public deleteDestroyedObjects(): void {
        const filtered = this.gameObjects.filter((obj) => !obj.isDestroyed);
        this._gameObjects$.next(filtered);
    }
}
