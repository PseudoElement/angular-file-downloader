import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';
import { DelayMs, DinoGameState } from '../models/common';
import { Difficulty } from '../models/animation-types';
import { BaseGameObject } from '../abstract/base-game-object';
import { Player } from '../game-objects/player';
import { isNil } from '../../../utils/is-nil';
import { isFarmableObject } from '../models/game-objects-types';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { MenuBestResultsInfo } from 'src/app/shared/components/game-menu/models/models';

@Injectable()
export class DinoGameStateService {
    public readonly gameStateSubj$ = new BehaviorSubject<DinoGameState>({
        time: 0,
        difficulty: 1,
        score: 0,
        isPlaying: false,
        isKilled: false,
        isStarted: false,
        gameId: null
    });

    public readonly bestResults$: Observable<MenuBestResultsInfo> = this.localStorageSrv.storageState$.pipe(
        map((state) => ({ bestScore: state.bestScore ?? undefined, bestTime: state.bestTime ?? undefined }))
    );

    public readonly gameState$ = this.gameStateSubj$.pipe(shareReplay({ bufferSize: 1, refCount: true }));

    private readonly _player$ = new BehaviorSubject<Player | null>(null);

    public readonly player$ = this._player$.asObservable();

    private readonly _gameObjects$ = new BehaviorSubject<BaseGameObject[]>([]);

    public readonly gameObjects$ = this._gameObjects$.asObservable();

    public get difficulty(): Difficulty {
        return this.gameStateSubj$.value.difficulty;
    }

    public get time(): DelayMs {
        return this.gameStateSubj$.value.time;
    }

    public get score(): number {
        return this.gameStateSubj$.value.score;
    }

    public get player(): Player | null {
        return this._player$.value;
    }

    public get gameObjects(): BaseGameObject[] {
        return this._gameObjects$.value;
    }

    public get gameId(): NodeJS.Timeout | null {
        return this.gameStateSubj$.value.gameId;
    }

    public get isPlaying(): boolean {
        return this.gameStateSubj$.value.isPlaying;
    }

    public get isKilled(): boolean {
        return this.gameStateSubj$.value.isKilled;
    }

    constructor(private readonly localStorageSrv: LocalStorageService) {}

    public changeGameState(state: Partial<DinoGameState>): void {
        if ('gameId' in state && state.gameId === null) {
            clearInterval(this.gameId!);
        }

        const newState = {
            ...this.gameStateSubj$.value,
            ...('isStarted' in state && { isStarted: state.isStarted }),
            ...('isPlaying' in state && { isPlaying: state.isPlaying }),
            ...('isKilled' in state && { isKilled: state.isKilled }),
            ...(!isNil(state.difficulty) && { difficulty: state.difficulty }),
            ...(!isNil(state.time) && { time: state.time }),
            ...(!isNil(state.score) && { score: state.score }),
            ...(state.gameId && { gameId: state.gameId })
        } as DinoGameState;

        this.gameStateSubj$.next(newState);
    }

    public setPlayer(player: Player | null): void {
        this._player$.next(player);
    }

    public addGameObject(obj: BaseGameObject): void {
        this.gameObjects.push(obj);
        this._gameObjects$.next(this.gameObjects);
    }

    public deleteGameObjects(all: boolean): void {
        if (all) {
            this.gameObjects.forEach((obj) => obj.destroy());
            this._gameObjects$.next([]);
        } else {
            this.gameObjects.forEach((obj) => {
                if (obj.needDestroy()) obj.destroy();
            });

            const notDestroyed = this.gameObjects.filter((obj) => !obj.isDestroyed);
            const passedFarmable = this.gameObjects.filter((obj) => obj.isDestroyed && isFarmableObject(obj));
            const reward = this.gameObjects.length - notDestroyed.length - passedFarmable.length;

            this._gameObjects$.next(notDestroyed);
            this.changeGameState({ score: this.score + reward });
        }
    }
}
