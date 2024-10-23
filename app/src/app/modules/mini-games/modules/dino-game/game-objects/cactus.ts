import { BehaviorSubject, Observable } from 'rxjs';
import { ObjectCoords } from '../../../models/game-object-types';
import { CactusAction, MobileObject } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { Difficulty } from '../models/animation-types';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';

export class Cactus extends BaseGameObject implements MobileObject<CactusAction> {
    protected get defaultImgSrc(): string {
        throw new Error('Method not implemented.');
    }
    protected readonly _coords$: BehaviorSubject<ObjectCoords>;

    constructor(params: BaseGameObjectParams, private readonly difficulty$: Observable<Difficulty>) {
        const rootNode = document.getElementById(DYNO_CONTAINER_ID)!;
        super(params, rootNode);

        this._coords$ = new BehaviorSubject<ObjectCoords>({
            leftX: params.startX,
            topY: params.startY,
            rightX: params.startX + this.el.offsetWidth,
            bottomY: params.startY + this.el.offsetHeight,
            visibleTopY: params.startY - this.el.offsetHeight * 0.5,
            visibleRightX: params.startX + this.el.offsetWidth * 0.5
        });
    }

    public async move(_action: CactusAction): Promise<void> {}

    private _changeCoordX(): void {
        this.el.style.left = `${this.el.offsetLeft + deltaX}px`;
        this._coords$.next({
            ...this._coords$.value,
            leftX: this.el.offsetLeft + deltaX,
            rightX: this.el.offsetLeft + this.el.offsetWidth + deltaX,
            visibleRightX: this.el.offsetLeft - this.el.offsetWidth * 0.5 + deltaX
        });
    }
}
