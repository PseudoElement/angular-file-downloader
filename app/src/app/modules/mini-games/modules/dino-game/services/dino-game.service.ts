import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { Player } from '../game-objects/player';
import { DinoGameObservers } from './dino-game-observers.service';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { DinoGameContainerService } from './dino-game-container.service';
import { Cactus } from '../game-objects/cactus';
import { BaseGameObject } from '../abstract/base-game-object';
import { CactusAction, isMobileObject } from '../abstract/game-objects-types';
import { DinoGameState } from '../models/common';
import { DinoGameStateService } from './dino-game-state.service';

@Injectable()
export class DinoGameService {
    private readonly gameState$ = this.gameStateSrv.gameState$;

    public readonly bgAnimationStyle$ = this.gameState$.pipe(
        map((state) => (!state.isPlaying ? 'inactive' : `active-difficulty-${state.difficulty}`))
    );

    constructor(
        private readonly dinoGameObservers: DinoGameObservers,
        private readonly gameContainerSrv: DinoGameContainerService,
        private readonly gameStateSrv: DinoGameStateService
    ) {}

    public async startGame(): Promise<void> {
        this.spawnPlayer();
        this.gameStateSrv.changeGameState({ isPlaying: true, difficulty: 1 });

        this.dinoGameObservers.listenVisibilityChange(this.pauseGame.bind(this), this.unpauseGame.bind(this));
        this.dinoGameObservers.listenGameObjectsCoords();
        this.dinoGameObservers.listenKeyEvents();

        this.gameStateSrv.player!.doAction('inactiveRun');
        this.runScene();
    }

    public pauseGame(): void {
        this.dinoGameObservers.clearListeners();
        this.gameStateSrv.player!.doAction('inactive');
        this.gameStateSrv.changeGameState({ isPlaying: false, gameId: null });
    }

    public async unpauseGame(): Promise<void> {
        this.gameStateSrv.changeGameState({ isPlaying: true });
        this.dinoGameObservers.listenKeyEvents();
        this.dinoGameObservers.listenGameObjectsCoords();

        this.gameStateSrv.player!.doAction('inactiveRun');
        this.gameStateSrv.gameObjects.forEach((obj) => {
            if (isMobileObject<CactusAction>(obj)) {
                obj.move('moveLeft');
            }
        });

        this.runScene();
    }

    public endGame(): void {
        this.dinoGameObservers.clearListeners();
        this.gameStateSrv.changeGameState({ difficulty: 1, isPlaying: false });
        this.gameStateSrv.setPlayer(null);
    }

    private runScene(): void {
        const delay = 3_000;

        const gameId = setInterval(() => {
            this.spawnCactus();
            this.gameStateSrv.deleteDestroyedObjects();
            this.gameStateSrv.changeGameState({ time: this.gameStateSrv.time + delay });
        }, delay);

        this.gameStateSrv.changeGameState({ gameId });
    }

    private spawnPlayer(): void {
        const player = new Player(
            { height: '150px', width: '200px', startX: 60, startY: 390 },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this.gameState$
        );

        this.gameStateSrv.setPlayer(player);
    }

    private spawnCactus(): void {
        const containerWidth = document.getElementById(DYNO_CONTAINER_ID)!.offsetWidth;
        const cactus = new Cactus(
            { height: '150px', width: '120px', startX: containerWidth - 100, startY: 390 },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this.gameState$
        );

        this.gameStateSrv.addGameObject(cactus);
    }
}
