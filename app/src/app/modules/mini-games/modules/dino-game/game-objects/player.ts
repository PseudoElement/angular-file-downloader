import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerAction } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { wait } from 'src/app/utils/wait';
import { Difficulty, PlayerAnimation } from '../models/animation-types';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { ANIMATION_PER_ACTION } from '../constants/animation-ticks';
import { DinoGameState } from '../models/common';
import { DIFFICULTY_CONFIG } from '../constants/main-config';

export class Player extends BaseGameObject<HTMLImageElement> {
    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    public readonly animations: Record<PlayerAnimation, () => void> = {
        inactive: this.animateInactive,
        move: this.animateMove
    };

    public currAction: PlayerAction = 'inactive';

    private currAnimation: PlayerAnimation = 'inactive';

    private get difficulty(): Difficulty {
        return this.gameState$.value.difficulty;
    }

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/png/Idle (1).png';
    }

    private isJumping = false;

    constructor(
        params: BaseGameObjectParams,
        containerInfo: GameContainerInfo,
        private readonly gameState$: BehaviorSubject<DinoGameState>
    ) {
        const rootNode = document.getElementById(containerInfo.id)!;
        super(params, containerInfo, rootNode);

        const left = parseFloat(this.el.style.left);
        const top = parseFloat(this.el.style.top);

        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            leftX: left,
            topY: top,
            rightX: top + this.el.offsetWidth,
            bottomY: top + this.el.offsetHeight,
            visibleTopY: top + this.el.offsetHeight - this.el.offsetHeight * 0.5,
            visibleRightX: left + this.el.offsetWidth - this.el.offsetWidth * 0.5
        });
        this.updateStyles();
    }

    protected createImg(params: BaseGameObjectParams): HTMLImageElement {
        const img = document.createElement('img');
        img.style.width = params.width;
        img.style.height = params.height;
        img.src = params.imgSrc || this.defaultImgSrc;

        return img;
    }

    public needDestroy(): boolean {
        return false;
    }

    public async doAction(action: PlayerAction): Promise<void> {
        this.currAction = action;
        const notShowAnimation = this.currAnimation === ANIMATION_PER_ACTION[action] && this.currAnimation === 'move';
        this.currAnimation = ANIMATION_PER_ACTION[action];

        if (!notShowAnimation) this.animations[this.currAnimation].call(this);

        if (action === 'moveRight') this.moveRight();
        if (action === 'moveLeft') this.moveLeft();
        if (action === 'jump') this.jump();
        if (action === 'die') this.die();
        if (action === 'crawl') this.crawl();
        if (action === 'uncrawl') this.uncrawl();
    }

    private animateMove(): void {
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
        let idx = 0;

        const callback = (_timestamp: number) => {
            if (this.currAnimation !== 'move') return;

            setTimeout(() => {
                const img = imgs[idx];
                this.changeImg(img);

                if (idx < imgs.length - 1) idx++;
                else idx = 0;

                window.requestAnimationFrame(callback);
            }, 70);
        };

        window.requestAnimationFrame(callback);
    }

    private animateInactive(): void {
        this.changeImg('../../../../../../assets/dino-game/png/Idle (1).png');
    }

    private jump(): void {
        if (this.isJumping) return;

        this.isJumping = true;
        const deltaY = DIFFICULTY_CONFIG[this.difficulty].playerDeltaY;
        let idx = 0;

        const callback = () => {
            if (idx >= 24) {
                this.isJumping = false;
                return;
            }

            if (idx < 12) {
                this._changeCoordY(-deltaY);
                this._changeCoordX(5);
            } else {
                this._changeCoordY(deltaY);
                this._changeCoordX(5);
            }

            idx++;
            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 30);
        };

        window.requestAnimationFrame(callback);
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

    private _changeCoordY(deltaY: number = 0): void {
        const prevTop = parseInt(this.el.style.top);
        this.el.style.top = `${prevTop + deltaY}px`;
        const newTop = parseInt(this.el.style.top);

        const topY = newTop;
        const visibleTopY = newTop + this.el.offsetHeight * 0.5;
        const bottomY = newTop + this.el.offsetHeight;

        this._coords$.next({
            ...this._coords$.value,
            topY,
            bottomY,
            visibleTopY
        });
    }

    private moveRight(): void {
        if (this.checkEnds().isRightEnd) return;
        const deltaX = DIFFICULTY_CONFIG[this.difficulty].playerDeltaX;
        window.requestAnimationFrame(() => this._changeCoordX(deltaX));
    }

    private moveLeft(): void {
        if (this.checkEnds().isLeftEnd) return;
        const deltaX = -DIFFICULTY_CONFIG[this.difficulty].playerDeltaX;
        window.requestAnimationFrame(() => this._changeCoordX(deltaX));
    }

    private async die(): Promise<void> {}

    private async crawl(): Promise<void> {
        const widthNum = parseFloat(this.el.style.width);
        const heightNum = parseFloat(this.el.style.height);

        this.el.style.width = `${widthNum / 2}px`;
        this.el.style.height = `${heightNum / 2}px`;
        this.imgEl.style.width = `${widthNum / 2}px`;
        this.imgEl.style.height = `${heightNum / 2}px`;

        this._changeCoordY(heightNum / 2);
    }

    private async uncrawl(): Promise<void> {
        const widthNum = parseFloat(this.el.style.width);
        const heightNum = parseFloat(this.el.style.height);

        this.el.style.width = `${widthNum * 2}px`;
        this.el.style.height = `${heightNum * 2}px`;
        this.imgEl.style.width = `${widthNum * 2}px`;
        this.imgEl.style.height = `${heightNum * 2}px`;

        this._changeCoordY(-heightNum);
    }

    private updateStyles(): void {
        this.el.style.zIndex = '1000';
        this.el.style.transition = 'all 50ms';
    }
}
