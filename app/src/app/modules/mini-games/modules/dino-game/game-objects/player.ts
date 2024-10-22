import { BehaviorSubject, Observable } from 'rxjs';
import { ActionType, ActiveObject, PlayerAction } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { wait } from 'src/app/utils/wait';
import { Difficulty, PlayerAnimation } from '../models/animation-types';
import { ObjectCoords } from '../../../models/game-object-types';
import { ANIMATION_PER_ACTION } from '../constants/animation-ticks';

export class Player extends BaseGameObject implements ActiveObject<PlayerAction> {
    public readonly animations: Record<PlayerAnimation, () => void> = {
        inactive: this.animateInactive,
        jump: this.animateJump,
        move: this.animateMove
    };

    private readonly _coords$: BehaviorSubject<ObjectCoords>;

    public currAction: PlayerAction = 'inactive';

    private currAnimation: PlayerAnimation = 'inactive';

    // private readonly initialOffsetTop: number;

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/png/Idle (1).png';
    }

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
        // this.initialOffsetTop = params.startY - 100;
    }

    public getCoords$(): Observable<ObjectCoords> {
        return this._coords$.asObservable();
    }

    public async doAction(action: PlayerAction): Promise<void> {
        this.currAction = action;
        const notShowAnimation = this.currAnimation === ANIMATION_PER_ACTION[action] && this.currAnimation === 'move';
        this.currAnimation = ANIMATION_PER_ACTION[action];

        if (!notShowAnimation) this.animations[this.currAnimation].call(this);

        if (action === 'moveRight') this.moveRightSlow();
        if (action === 'moveLeft') this.moveLeftSlow();
        if (action === 'jump') await this.jump();
        if (action === 'die') this.die();
        if (action === 'crawl') this.crawl();
        if (action === 'uncrawl') this.uncrawl();
    }

    public animateJump(): void {
        const imgsUp = [
            '../../../../../../assets/dino-game/png/Jump (2).png',
            '../../../../../../assets/dino-game/png/Jump (3).png',
            '../../../../../../assets/dino-game/png/Jump (4).png',
            '../../../../../../assets/dino-game/png/Jump (6).png',
            '../../../../../../assets/dino-game/png/Jump (7).png'
        ] as const;

        const imgsDown = [
            '../../../../../../assets/dino-game/png/Jump (10).png',
            '../../../../../../assets/dino-game/png/Jump (11).png',
            '../../../../../../assets/dino-game/png/Jump (12).png',
            '../../../../../../assets/dino-game/png/Jump (4).png',
            '../../../../../../assets/dino-game/png/Jump (2).png'
        ] as const;

        (async () => {
            for (const img of imgsUp) {
                this.changeImg(img);
                await wait(50);
            }
            for (const img of imgsDown) {
                this.changeImg(img);
                await wait(50);
            }
        })();
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

        (async () => {
            while (this.currAnimation === 'move') {
                for (const img of imgs) {
                    this.changeImg(img);
                    await wait(100);
                }
            }
        })();
    }

    private animateInactive(): void {
        this.changeImg('../../../../../../assets/dino-game/png/Idle (1).png');
    }

    private async jump(): Promise<void> {
        this.el.style.transition = `all 500ms`;
        this._changeCoordY(-300);
        await wait(515);
        this._changeCoordY(250);
        // await wait(200);
    }

    public _changeCoordX(deltaX: number): void {
        this.el.style.left = `${this.el.offsetLeft + deltaX}px`;
        this._coords$.next({
            ...this._coords$.value,
            leftX: this.el.offsetLeft + deltaX,
            rightX: this.el.offsetLeft + this.el.offsetWidth + deltaX,
            visibleRightX: this.el.offsetLeft - this.el.offsetWidth * 0.5 + deltaX
        });
    }

    public _changeCoordY(deltaY: number): void {
        this.el.style.top = `${this.el.offsetTop + deltaY}px`;
        this._coords$.next({
            ...this._coords$.value,
            topY: this.el.offsetTop + deltaY,
            bottomY: this.el.offsetTop + this.el.offsetHeight + deltaY,
            visibleTopY: this.el.offsetTop - this.el.offsetHeight * 0.5 + deltaY
        });
    }

    private moveRightFast(): void {
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(75);
    }

    private moveLeftFast(): void {
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(-75);
    }

    private async moveRightSlow(): Promise<void> {
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(50);
    }

    private async moveLeftSlow(): Promise<void> {
        this.el.style.transition = `all 50ms`;
        this._changeCoordX(-75);
    }

    private async die(): Promise<void> {}

    private async crawl(): Promise<void> {
        this._changeCoordY(150);
    }

    private async uncrawl(): Promise<void> {
        this._changeCoordY(-150);
    }
}
