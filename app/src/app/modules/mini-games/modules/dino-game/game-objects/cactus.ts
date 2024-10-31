import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { CactusAction, MobileObject } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { Difficulty } from '../models/animation-types';
import { DinoGameState } from '../models/common';
import { DIFFICULTY_CONFIG } from '../constants/main-config';

export class Cactus extends BaseGameObject<HTMLImageElement> implements MobileObject<CactusAction> {
    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/svg/cactus.svg';
    }

    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    private get difficulty(): Difficulty {
        return this._gameState$.value.difficulty;
    }

    private get isPlaying(): boolean {
        return this._gameState$.value.isPlaying;
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
            leftX: left,
            topY: top,
            rightX: left + this.el.offsetWidth,
            bottomY: top + this.el.offsetHeight,
            visibleTopY: top + this.el.offsetHeight - this.el.offsetHeight * 0.5,
            visibleRightX: left + this.el.offsetWidth - this.el.offsetWidth * 0.5
        });

        this.move('moveLeft');
    }

    protected createImg(params: BaseGameObjectParams): HTMLImageElement {
        const img = document.createElement('img');
        img.style.width = params.width;
        img.style.height = params.height;
        img.src = params.imgSrc || this.defaultImgSrc;

        return img;
    }

    public move(_action: CactusAction): void {
        const callback = (_timestamp: number) => {
            if (this.isDestroyed || !this.isPlaying) return;

            this._changeCoordX(DIFFICULTY_CONFIG[this.difficulty].cactusSpeed);

            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 50);
        };

        window.requestAnimationFrame(callback);
    }

    public needDestroy(): boolean {
        return this.checkEnds().isLeftEnd;
    }

    private _changeCoordX(deltaX: number): void {
        const prevLeft = parseInt(this.el.style.left);
        this.el.style.left = `${prevLeft + deltaX}px`;
        const newLeft = parseInt(this.el.style.left);

        this._coords$.next({
            ...this._coords$.value,
            leftX: newLeft,
            rightX: newLeft + this.el.offsetWidth,
            visibleRightX: newLeft + this.el.offsetWidth - this.el.offsetWidth * 0.5
        });
    }
}
