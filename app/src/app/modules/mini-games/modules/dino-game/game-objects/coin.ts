import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { CanvasGameObject } from '../abstract/canvas-game-object';
import { GAME_OBJECTS } from '../constants/game-objects';
import { CoinAnimation } from '../models/animation-types';
import { AnimatedObject, CoinAction, Farmable, MobileObject } from '../models/game-objects-types';
import { GameObjectSpritesheetConfigs, ImagesForGameObject } from '../models/spritesheet-types';
import { BaseGameObjectParams } from '../abstract/base-game-object';
import { DinoGameState, FarmReward } from '../models/common';

export class Coin extends CanvasGameObject implements MobileObject<CoinAction>, AnimatedObject<CoinAnimation>, Farmable {
    public type = GAME_OBJECTS.COIN;

    public get price(): number {
        return 10;
    }

    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    protected get imagesSrcs(): ImagesForGameObject {
        return { move: ['../../../../../../assets/dino-game/coin/dollar-coin.png'] };
    }

    private get isPlaying(): boolean {
        return this._gameState$.value.isPlaying;
    }

    protected getSpriteConfig(): GameObjectSpritesheetConfigs {
        return {
            move: {
                columns: 5,
                rows: 2,
                count: 10,
                imgHeight: 250,
                imgWidth: 192, //191
                offsetLeft: 18.3, //19.5
                offsetTop: 60,
                canvasHeight: parseInt(this.params.height),
                canvasWidth: parseInt(this.params.width)
            }
        };
    }

    constructor(
        params: BaseGameObjectParams,
        containerInfo: GameContainerInfo,
        private readonly _gameState$: BehaviorSubject<DinoGameState>
    ) {
        const rootNode = document.getElementById(containerInfo.id)!;
        super(params, containerInfo, rootNode);

        const left = parseFloat(this.el.style.left);
        const top = parseFloat(this.el.style.top);

        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            left: left,
            top: top,
            right: left + this.el.offsetWidth,
            bottom: top + this.el.offsetHeight
        });

        this.loadSprites();
        this.move('moveLeft');
        this.animate('rotateLeft');
    }

    protected setCanvasStyles(_canvas: HTMLCanvasElement): void {}

    public needDestroy(): boolean {
        return this.checkEnds().isLeftEnd;
    }

    public move(_action: CoinAction = 'moveLeft'): void {
        const callback = () => {
            if (this.isDestroyed || !this.isPlaying) return;
            this._changeCoordX(-20);

            setTimeout(() => window.requestAnimationFrame(callback), 40);
        };

        window.requestAnimationFrame(callback);
    }

    public animate(_animation: CoinAnimation = 'rotateLeft'): void {
        let frameNum = 1;
        const moveConfig = this.getSpriteConfig().move!;

        const callback = () => {
            if (this.isDestroyed || !this.isPlaying) return;
            this.draw('move', frameNum);

            if (frameNum < moveConfig.count) frameNum++;
            else frameNum = 1;

            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 50);
        };

        window.requestAnimationFrame(callback);
    }

    public beGrabbed(): FarmReward {
        const audio = new Audio('../../../../../../assets/audio/coin-earn.mp3');
        audio.currentTime = 0.15;
        audio.play();

        this.destroy();

        return this.price;
    }
}
