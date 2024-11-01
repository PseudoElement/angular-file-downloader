import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Difficulty } from '../models/animation-types';
import { Player } from '../game-objects/player';
import { DinoGameObservers } from './dino-game-observers.service';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { DinoGameContainerService } from './dino-game-container.service';
import { Cactus } from '../game-objects/cactus';
import { BirdAction, CactusAction, isAnimatedObject, isMobileObject } from '../abstract/game-objects-types';
import { DinoGameStateService } from './dino-game-state.service';
import { DIFFICULTY_CONFIG } from '../constants/main-config';
import { Bird } from '../game-objects/bird';

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

    public startGame(): void {
        this.spawnPlayer();
        this.gameStateSrv.changeGameState({ isPlaying: true, isStarted: true, difficulty: 1 });

        this.dinoGameObservers.listenVisibilityChange(this.pauseGame.bind(this));
        this.dinoGameObservers.listenGameObjectsCoords();
        this.dinoGameObservers.listenKeyEvents(this.pauseGame.bind(this), this.unpauseGame.bind(this));

        this.gameStateSrv.player!.doAction('inactiveRun');
        this.runScene();
    }

    public restartGame(): void {
        this.endGame();
        this.spawnPlayer();

        this.dinoGameObservers.listenGameObjectsCoords();
        this.dinoGameObservers.listenKeyEvents(this.pauseGame.bind(this), this.unpauseGame.bind(this));

        this.gameStateSrv.changeGameState({ isPlaying: true, isStarted: true, difficulty: 1 });
        this.gameStateSrv.player!.doAction('inactiveRun');
        this.runScene();
    }

    public pauseGame(): void {
        this.gameStateSrv.player!.doAction('inactive');
        this.gameStateSrv.changeGameState({ isPlaying: false, gameId: null });
    }

    public unpauseGame(): void {
        this.gameStateSrv.changeGameState({ isPlaying: true });
        this.gameStateSrv.player!.doAction('inactiveRun');
        this.gameStateSrv.gameObjects.forEach((obj) => {
            if (isMobileObject<CactusAction>(obj)) {
                obj.move('moveLeft');
            }
            if (isAnimatedObject<BirdAction>(obj)) {
                obj.animate('moveLeft');
            }
        });

        this.runScene();
    }

    public endGame(): void {
        this.dinoGameObservers.clearListeners();
        this.gameStateSrv.deleteGameObjects(true);
        this.gameStateSrv.player?.destroy();
        this.gameStateSrv.changeGameState({ difficulty: 1, isPlaying: false, isStarted: false, gameId: null });
        this.gameStateSrv.setPlayer(null);
    }

    private runScene(): void {
        const { nextRoundWhen, spawnDelay } = DIFFICULTY_CONFIG[this.gameStateSrv.difficulty];
        const gameId = setInterval(() => {
            if (this.gameStateSrv.time > nextRoundWhen) this.raiseDifficulty();

            this.spawnBird();
            this.spawnCactus();

            this.gameStateSrv.deleteGameObjects(false);
            this.gameStateSrv.changeGameState({ time: this.gameStateSrv.time + spawnDelay });
        }, spawnDelay);

        this.gameStateSrv.changeGameState({ gameId });
    }

    private spawnPlayer(): void {
        const container = document.getElementById(DYNO_CONTAINER_ID)!;
        const containerHeight = container.offsetHeight;
        const top = Math.floor(containerHeight * 0.68);

        const player = new Player(
            { height: '150px', width: '200px', left: `60px`, top: `${top}px` },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this.gameState$
        );

        this.gameStateSrv.setPlayer(player);
    }

    private spawnCactus(): void {
        const container = document.getElementById(DYNO_CONTAINER_ID)!;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const top = Math.floor(containerHeight * 0.68);

        const cactus = new Cactus(
            { height: '160px', width: '160px', left: `${containerWidth - 50}px`, top: `${top}px` },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this.gameState$
        );

        this.gameStateSrv.addGameObject(cactus);
    }

    private spawnBird(): void {
        const container = document.getElementById(DYNO_CONTAINER_ID)!;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const minPercent = 0.2;
        const maxPercent = 0.55;
        const randomPercent = minPercent + Number((Math.random() * (maxPercent - minPercent)).toFixed(2));
        const top = Math.floor(containerHeight * randomPercent);

        const bird = new Bird(
            { height: '75px', width: '100px', left: `${containerWidth}px`, top: `${top}px` },
            { id: DYNO_CONTAINER_ID, coords$: this.gameContainerSrv.gameContainerCoords$ },
            this.gameState$
        );
        this.gameStateSrv.addGameObject(bird);
    }

    private raiseDifficulty(): void {
        this.gameStateSrv.changeGameState({ difficulty: (this.gameStateSrv.difficulty + 1) as Difficulty, gameId: null });
        this.runScene();
    }
}
