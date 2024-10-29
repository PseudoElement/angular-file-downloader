import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerAction } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { wait } from 'src/app/utils/wait';
import { Difficulty, PlayerAnimation } from '../models/animation-types';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { ANIMATION_PER_ACTION } from '../constants/animation-ticks';
import { DinoGameState } from '../models/common';

export class Player extends BaseGameObject {
    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    public readonly animations: Record<PlayerAnimation, () => Promise<void>> = {
        inactive: this.animateInactive,
        move: this.animateMove
    };

    private readonly initParams: BaseGameObjectParams;

    public currAction: PlayerAction = 'inactive';

    private currAnimation: PlayerAnimation = 'inactive';

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/png/Idle (1).png';
    }

    constructor(
        params: BaseGameObjectParams,
        containerInfo: GameContainerInfo,
        private readonly gameState$: BehaviorSubject<DinoGameState>
    ) {
        const rootNode = document.getElementById(containerInfo.id)!;
        super(params, containerInfo, rootNode);

        this.initParams = params;
        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            leftX: params.startX,
            topY: params.startY,
            rightX: params.startX + this.el.offsetWidth,
            bottomY: params.startY + this.el.offsetHeight,
            visibleTopY: params.startY - this.el.offsetHeight * 0.5,
            visibleRightX: params.startX + this.el.offsetWidth * 0.5
        });
        this.updateStyles();
    }

    public async doAction(action: PlayerAction): Promise<void> {
        this.currAction = action;
        const notShowAnimation = this.currAnimation === ANIMATION_PER_ACTION[action] && this.currAnimation === 'move';
        this.currAnimation = ANIMATION_PER_ACTION[action];

        if (!notShowAnimation) this.animations[this.currAnimation].call(this).then();

        if (action === 'moveRight') this.moveRightSlow();
        if (action === 'moveLeft') this.moveLeftSlow();
        if (action === 'jump') await this.jump();
        if (action === 'die') this.die();
        if (action === 'crawl') this.crawl();
        if (action === 'uncrawl') this.uncrawl();
    }

    private async animateMove(): Promise<void> {
        const imgsFast = [
            '../../../../../../assets/dino-game/png/Run (1).png',
            '../../../../../../assets/dino-game/png/Run (2).png',
            '../../../../../../assets/dino-game/png/Run (3).png',
            '../../../../../../assets/dino-game/png/Run (4).png',
            '../../../../../../assets/dino-game/png/Run (5).png',
            '../../../../../../assets/dino-game/png/Run (6).png',
            '../../../../../../assets/dino-game/png/Run (7).png',
            '../../../../../../assets/dino-game/png/Run (8).png'
        ] as const;
        const imgsSlow = [
            '../../../../../../assets/dino-game/png/Walk (1).png',
            '../../../../../../assets/dino-game/png/Walk (2).png',
            '../../../../../../assets/dino-game/png/Walk (3).png',
            '../../../../../../assets/dino-game/png/Walk (5).png',
            '../../../../../../assets/dino-game/png/Walk (7).png',
            '../../../../../../assets/dino-game/png/Walk (8).png',
            '../../../../../../assets/dino-game/png/Walk (10).png'
        ] as const;

        const imgs = true ? imgsSlow : imgsFast;

        while (this.currAnimation === 'move') {
            for (const img of imgs) {
                this.changeImg(img);
                await wait(100);
            }
        }
    }

    private async animateInactive(): Promise<void> {
        await this.changeImg('../../../../../../assets/dino-game/png/Idle (1).png');
    }

    private async jump(): Promise<void> {
        this.el.style.transition = `all 500ms ease-in-out`;
        this._changeCoordY(false, -300);
        await wait(700);
        this._changeCoordY(true);
    }

    private async _changeCoordX(deltaX: number): Promise<void> {
        this.el.style.left = `${this.el.offsetLeft + deltaX}px`;

        await wait(100);
        this._coords$.next({
            ...this._coords$.value,
            leftX: this.el.offsetLeft + deltaX,
            rightX: this.el.offsetLeft + this.el.offsetWidth + deltaX,
            visibleRightX: this.el.offsetLeft + this.el.offsetWidth + deltaX - this.el.offsetWidth * 0.5
        });
    }

    private async _changeCoordY(isReset: boolean, deltaY: number = 0): Promise<void> {
        let topY: number;
        let bottomY: number;
        let visibleTopY: number;
        if (isReset) {
            this.el.style.top = `${this.initParams.startY}px`;
            topY = this.initParams.startY;
            visibleTopY = this.initParams.startY + this.el.offsetHeight * 0.5;
            bottomY = this.initParams.startY + this.el.offsetHeight;
        } else {
            this.el.style.top = `${this.el.offsetTop + deltaY}px`;
            topY = this.el.offsetTop;
            visibleTopY = this.el.offsetTop + this.el.offsetHeight * 0.5;
            bottomY = this.el.offsetTop + this.el.offsetHeight;
        }

        await wait(300);
        this._coords$.next({
            ...this._coords$.value,
            topY,
            bottomY,
            visibleTopY
        });
    }

    private moveRightFast(): void {
        if (this.checkEnds().isRightEnd) return;
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(75);
    }

    private moveLeftFast(): void {
        if (this.checkEnds().isLeftEnd) return;
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(-75);
    }

    private moveRightSlow(): void {
        if (this.checkEnds().isRightEnd) return;
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(60).then();
    }

    private moveLeftSlow(): void {
        if (this.checkEnds().isLeftEnd) return;
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(-120).then();
    }

    private async die(): Promise<void> {}

    private async crawl(): Promise<void> {
        this.el.style.transition = `all 150ms`;

        const widthNum = parseFloat(this.initParams.width);
        const heightNum = parseFloat(this.initParams.height);

        const widthUnit = this.initParams.width.replace(widthNum.toString(), '');
        const heightUnit = this.initParams.height.replace(heightNum.toString(), '');

        this.el.style.width = `${widthNum / 2}${widthUnit}`;
        this.el.style.height = `${heightNum / 2}${heightUnit}`;
        this.imgEl.style.width = `${widthNum / 2}${widthUnit}`;
        this.imgEl.style.height = `${heightNum / 2}${heightUnit}`;

        this._changeCoordY(false, heightNum / 2 - 20);
    }

    private async uncrawl(): Promise<void> {
        this.el.style.transition = `all 150ms`;

        this.el.style.width = this.initParams.width;
        this.el.style.height = this.initParams.height;
        this.imgEl.style.width = this.initParams.width;
        this.imgEl.style.height = this.initParams.height;

        this._changeCoordY(true);
    }

    private updateStyles(): void {
        this.el.style.zIndex = '1000';
    }
}
