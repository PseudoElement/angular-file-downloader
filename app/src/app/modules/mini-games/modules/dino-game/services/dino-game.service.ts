import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { Player } from '../game-objects/player';
import { DinoGameControlsService } from './dino-game-controls.service';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { DinoGameContainerService } from './dino-game-container.service';
import { wait } from 'src/app/utils/wait';
import { Cactus } from '../game-objects/cactus';
import { BaseGameObject } from '../abstract/base-game-object';

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

    constructor(private readonly dinoGameControls: DinoGameControlsService, private readonly gameContainerSrv: DinoGameContainerService) {}

    public async startGame(): Promise<void> {
        this.spawnPlayer();

        this.dinoGameControls.listenKeyEvents(this.player!);
        this.setPlayState(true);
        this._difficulty$.next(1);

        this.player!.doAction('inactiveRun');

        while (true) {
            await wait(8_000);
            this.spawnCactus();
            this.deleteDestroyedObjects();
            console.log(this.gameObjects);
        }
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
            { height: '150px', width: '150px', startX: containerWidth + 100, startY: 390 },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this._difficulty$
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
