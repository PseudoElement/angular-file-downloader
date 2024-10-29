import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { CactusAction, MobileObject } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { Difficulty } from '../models/animation-types';
import { CACTUS_SPEED_RATIO } from '../constants/speeds';
import { wait } from 'src/app/utils/wait';
import { DinoGameState } from '../models/common';

export class Cactus extends BaseGameObject implements MobileObject<CactusAction> {
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

        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            leftX: params.startX,
            topY: params.startY,
            rightX: params.startX + this.el.offsetWidth,
            bottomY: params.startY + this.el.offsetHeight,
            visibleTopY: params.startY - this.el.offsetHeight * 0.5,
            visibleRightX: params.startX + this.el.offsetWidth * 0.5
        });
        this.move('moveLeft');
    }

    public move(_action: CactusAction): void {
        (async () => {
            while (!this.isDestroyed && this.isPlaying) {
                await wait(30);
                if (this.checkEnds().isLeftEnd) this.destroy();
                this._changeCoordX(CACTUS_SPEED_RATIO[this.difficulty]);
            }
        })();
    }

    private _changeCoordX(deltaX: number): void {
        this.el.style.left = `${this.el.offsetLeft + deltaX}px`;
        this._coords$.next({
            ...this._coords$.value,
            leftX: this.el.offsetLeft + deltaX,
            rightX: this.el.offsetLeft + this.el.offsetWidth + deltaX,
            visibleRightX: this.el.offsetLeft - this.el.offsetWidth * 0.5 + deltaX
        });
    }
}
