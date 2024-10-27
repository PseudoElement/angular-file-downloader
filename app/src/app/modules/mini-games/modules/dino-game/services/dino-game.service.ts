import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, fromEvent, map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { Player } from '../game-objects/player';
import { DinoGameObservers } from './dino-game-observers.service';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { DinoGameContainerService } from './dino-game-container.service';
import { wait } from 'src/app/utils/wait';
import { Cactus } from '../game-objects/cactus';
import { BaseGameObject } from '../abstract/base-game-object';
import { CactusAction, isMobileObject } from '../abstract/game-objects-types';

@Injectable()
export class DinoGameService {
    public readonly _difficulty$ = new BehaviorSubject<Difficulty>(1);

    public readonly _isPlaying = new BehaviorSubject(false);

    private player: Player | null = null;

    private gameObjects: BaseGameObject[] = [];

    public get difficulty(): Difficulty {
        return this._difficulty$.value;
    }

    public readonly bgAnimationStyle$ = this._difficulty$.pipe(
        combineLatestWith(this._isPlaying),
        map(([diff, isPlaying]) => (!isPlaying ? 'inactive' : `active-difficulty-${diff}`))
    );

    constructor(private readonly dinoGameObservers: DinoGameObservers, private readonly gameContainerSrv: DinoGameContainerService) {}

    public async startGame(): Promise<void> {
        this.spawnPlayer();

        this.dinoGameObservers.listenVisibilityChange(this.pauseGame.bind(this), this.unpauseGame.bind(this));
        this.dinoGameObservers.listenKeyEvents(this.player!);
        this.setPlayState(true);
        this._difficulty$.next(1);

        this.player!.doAction('inactiveRun');

        this.runScene().then();
    }

    public pauseGame(): void {
        this.setPlayState(false);
        this.dinoGameObservers.clearListeners();
        this.player!.doAction('inactive');
    }

    public async unpauseGame(): Promise<void> {
        this.setPlayState(true);
        this.dinoGameObservers.listenKeyEvents(this.player!);
        this.player!.doAction('inactiveRun');
        this.gameObjects.forEach((obj) => {
            if (isMobileObject<CactusAction>(obj)) {
                obj.move('moveLeft');
            }
        });
        await this.runScene();
    }

    public endGame(): void {
        this.setPlayState(false);
        this.dinoGameObservers.clearListeners();
        this._difficulty$.next(1);
        this.player = null;
    }

    private async runScene(): Promise<void> {
        while (this._isPlaying.value) {
            await wait(3_000);
            console.log('spawnCactus');
            this.spawnCactus();
            this.deleteDestroyedObjects();
        }
    }

    private spawnPlayer(): void {
        this.player = new Player(
            { height: '150px', width: '200px', startX: 60, startY: 390 },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this._difficulty$
        );
    }

    private spawnCactus(): void {
        const containerWidth = document.getElementById(DYNO_CONTAINER_ID)!.offsetWidth;
        const cactus = new Cactus(
            { height: '150px', width: '120px', startX: containerWidth - 100, startY: 390 },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this._difficulty$,
            this._isPlaying
        );
        this.gameObjects.push(cactus);
    }

    private deleteDestroyedObjects(): void {
        this.gameObjects = this.gameObjects.filter((obj) => !obj.isDestroyed);
    }

    private setPlayState(isPlaying: boolean): void {
        this._isPlaying.next(isPlaying);
    }

    private raiseDifficulty(): void {
        if (this._difficulty$.value + 1 > 6) return;
        this._difficulty$.next((this._difficulty$.value + 1) as Difficulty);
    }
}
