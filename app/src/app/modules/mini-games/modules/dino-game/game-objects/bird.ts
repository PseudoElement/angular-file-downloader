import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { AnimatedObject, BirdAction, MobileObject } from '../models/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DinoGameState } from '../models/common';
import { BirdAnimation, Difficulty } from '../models/animation-types';
import { GameObjectSpritesheetConfigs, ImagesForGameObject, SpriteSheetConfig } from '../models/spritesheet-types';
import { DIFFICULTY_CONFIG } from '../constants/main-config';
import { GAME_OBJECTS } from '../constants/game-objects';
import { CanvasGameObject } from '../abstract/canvas-game-object';

export class Bird extends CanvasGameObject implements MobileObject<BirdAction>, AnimatedObject<BirdAnimation> {
    public type = GAME_OBJECTS.BIRD;

    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    protected getSpriteConfig(): GameObjectSpritesheetConfigs {
        return {
            move: {
                columns: 4,
                rows: 2,
                count: 8,
                imgHeight: 100,
                imgWidth: 150,
                offsetLeft: 0,
                offsetTop: 200,
                canvasHeight: parseInt(this.params.height),
                canvasWidth: parseInt(this.params.width)
            }
        };
    }

    protected get imagesSrcs(): ImagesForGameObject {
        return { move: ['../../../../../../assets/dino-game/bird/FlyingGameCharacter.png'] };
    }

    private get isPlaying(): boolean {
        return this._gameState$.value.isPlaying;
    }

    private get difficulty(): Difficulty {
        return this._gameState$.value.difficulty;
    }

    constructor(
        params: BaseGameObjectParams,
        containerInfo: GameContainerInfo,
        private readonly _gameState$: BehaviorSubject<DinoGameState>
    ) {
        const rootNode = document.getElementById(containerInfo.id)!;
        super(params, containerInfo, rootNode);

        const left = parseInt(this.el.style.left);
        const top = parseInt(this.el.style.top);

        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            left: left,
            top: top,
            right: left + this.el.offsetWidth,
            bottom: top + this.el.offsetHeight
        });

        this.loadSprites();
        this.animate('fly');
        this.move('moveLeft');
    }

    public animate(_animation: BirdAnimation = 'fly'): void {
        let frameNum = 1;
        const moveConfig = this.getSpriteConfig().move!;

        const callback = () => {
            if (this.isDestroyed || !this.isPlaying) return;
            this.draw('move', frameNum);

            if (frameNum < moveConfig.count) frameNum++;
            else frameNum = 1;

            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 100);
        };

        window.requestAnimationFrame(callback);
    }

    public override needDestroy(): boolean {
        return this.checkEnds().isLeftEnd;
    }

    public move(_action: BirdAction = 'moveLeft'): void {
        let idx = 0;
        const callback = (_timestamp: number) => {
            if (this.isDestroyed || !this.isPlaying) return;

            this._changeCoordX(DIFFICULTY_CONFIG[this.difficulty].birdSpeed);
            idx < 15 ? this._changeCoordY(3) : this._changeCoordY(-3);

            if (idx < 30) idx++;
            else idx = 0;

            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 40);
        };

        window.requestAnimationFrame(callback);
    }

    protected setCanvasStyles(canvas: HTMLCanvasElement): void {
        canvas.style.transform = 'rotateY(180deg)';
    }
}
