import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { CactusAction, MobileObject } from '../models/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { Difficulty } from '../models/animation-types';
import { DinoGameState } from '../models/common';
import { DIFFICULTY_CONFIG } from '../constants/main-config';
import { GAME_OBJECTS } from '../constants/game-objects';

export class Cactus extends BaseGameObject<HTMLImageElement> implements MobileObject<CactusAction> {
    private showCollision(): void {
        const coll = document.createElement('div');
        coll.style.border = '2px solid blue';
        coll.style.position = 'absolute';
        coll.style.top = `${parseInt(this.el.style.top + this.el.offsetHeight * 0.15)}px`;
        coll.style.bottom = `${parseInt(this.el.style.bottom)}px`;

        coll.style.width = `${Math.abs(parseInt(this.el.style.left) - parseInt(this.el.style.right))}px`;
        coll.style.height = `${Math.abs(parseInt(this.el.style.height) - this.el.offsetHeight * 0.1)}px`;

        this.el.append(coll);
    }

    public type = GAME_OBJECTS.CACTUS;

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
            left: left,
            top: top,
            right: left + this.el.offsetWidth,
            bottom: top + this.el.offsetHeight
        });

        this.move('moveLeft');
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

    protected override _changeCoordX(deltaX: number): void {
        const prevLeft = parseInt(this.el.style.left);
        this.el.style.left = `${prevLeft + deltaX}px`;
        const newLeft = parseInt(this.el.style.left);

        this._coords$.next({
            ...this._coords$.value,
            left: newLeft + this.el.offsetWidth * 0.15,
            right: newLeft + this.el.offsetWidth - this.el.offsetWidth * 0.15
        });
    }

    protected override _changeCoordY(deltaY: number = 0): void {
        const prevTop = parseInt(this.el.style.top);
        this.el.style.top = `${prevTop + deltaY}px`;
        const newTop = parseInt(this.el.style.top);

        this._coords$.next({
            ...this._coords$.value,
            top: newTop + this.el.offsetHeight * 0.15,
            bottom: newTop + this.el.offsetHeight
        });
    }

    protected createImg(params: BaseGameObjectParams): HTMLImageElement {
        const img = document.createElement('img');
        img.style.width = params.width;
        img.style.height = params.height;
        img.src = params.imgSrc || this.defaultImgSrc;

        return img;
    }
}
