import { BehaviorSubject } from 'rxjs';
import { AnimatedObject, PlayerAction } from '../models/game-objects-types';
import { BaseGameObjectParams } from '../abstract/base-game-object';
import { Difficulty, PlayerAnimation } from '../models/animation-types';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { ANIMATION_PER_ACTION } from '../constants/animation-ticks';
import { DinoGameState } from '../models/common';
import { DIFFICULTY_CONFIG } from '../constants/main-config';
import { GAME_OBJECTS } from '../constants/game-objects';
import { GameObjectSpritesheetConfigs, ImagesForGameObject, SpriteSheetConfig } from '../models/spritesheet-types';
import { CanvasGameObject } from '../abstract/canvas-game-object';

export class Player extends CanvasGameObject implements AnimatedObject<PlayerAnimation> {
    protected getSpriteConfig(): GameObjectSpritesheetConfigs {
        return {
            moving: {
                columns: 3,
                rows: 4,
                count: 10,
                offsetLeft: 0,
                offsetTop: 0,
                imgHeight: 370.25,
                imgWidth: 533.33,
                canvasHeight: parseInt(this.params.height),
                canvasWidth: parseInt(this.params.width)
            },
            inactive: {
                columns: 1,
                rows: 1,
                count: 1,
                offsetLeft: 0,
                offsetTop: 0,
                imgHeight: 472,
                imgWidth: 680,
                canvasHeight: parseInt(this.params.height),
                canvasWidth: parseInt(this.params.width)
            },
            die: {
                columns: 1,
                rows: 1,
                count: 1,
                offsetLeft: 0,
                offsetTop: 0,
                imgHeight: 472,
                imgWidth: 680,
                canvasHeight: parseInt(this.params.height),
                canvasWidth: parseInt(this.params.width)
            }
        };
    }

    public type = GAME_OBJECTS.PLAYER;

    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    private readonly visibleXRatio = 0.55;

    private readonly visibleYRatio = 0.1;

    private currAnimation: PlayerAnimation = 'inactive';

    private get difficulty(): Difficulty {
        return this.gameState$.value.difficulty;
    }

    protected get images(): ImagesForGameObject {
        return {
            inactive: ['../../../../../../assets/dino-game/png/Idle (1).png'],
            die: [
                '../../../../../../assets/dino-game/png/Dead_1.png',
                '../../../../../../assets/dino-game/png/Dead_2.png',
                '../../../../../../assets/dino-game/png/Dead_3.png',
                '../../../../../../assets/dino-game/png/Dead_4.png',
                '../../../../../../assets/dino-game/png/Dead_5.png',
                '../../../../../../assets/dino-game/png/Dead_6.png'
            ],
            jump: [],
            moving: ['../../../../../../assets/dino-game/player/dino-walk-sprite.png']
        };
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
            left: left,
            top: top + this.el.offsetHeight * this.visibleYRatio,
            right: left + this.el.offsetWidth - this.el.offsetWidth * this.visibleXRatio,
            bottom: top + this.el.offsetHeight - this.el.offsetHeight * this.visibleYRatio
        });
        this.updateStyles();

        this.loadSpriteImage('inactive', 0);
    }

    protected setCanvasStyles(): void {}

    public animate(animation: PlayerAnimation): void {
        if (animation === 'move') this.animateMove();
        else if (animation === 'die') this.animateDie();
        else this.animateInactive();
    }

    public needDestroy(): boolean {
        return false;
    }

    public async doAction(action: PlayerAction): Promise<void> {
        const notShowAnimation = this.currAnimation === ANIMATION_PER_ACTION[action] && this.currAnimation === 'move';
        this.currAnimation = ANIMATION_PER_ACTION[action];

        if (!notShowAnimation) this.animate(this.currAnimation);

        if (action === 'moveRight') this.moveRight();
        if (action === 'moveLeft') this.moveLeft();
        if (action === 'jump') this.jump();
        if (action === 'die') this.die();
        if (action === 'crawl') this.crawl();
        if (action === 'uncrawl') this.uncrawl();
    }

    private animateMove(): void {
        let idx = 1;
        this.loadSpriteImage('moving', 0);

        const callback = (_timestamp: number) => {
            if (this.currAnimation !== 'move') return;

            setTimeout(() => {
                this.draw('moving', idx);

                if (idx < this.getSpriteConfig().moving!.count) idx++;
                else idx = 1;

                window.requestAnimationFrame(callback);
            }, 70);
        };

        window.requestAnimationFrame(callback);
    }

    private animateInactive(): void {
        const drawCallback = this.draw.bind(this, 'inactive', 1);
        this.loadSpriteImage('inactive', 0, drawCallback);
    }

    private animateDie(): void {
        let idx = 0;
        const dieImgs = this.images.die!;

        const callback = () => {
            if (idx >= dieImgs.length) return;

            const drawCallback = this.draw.bind(this, 'die', 1);
            this.loadSpriteImage('die', idx, drawCallback);
            idx++;

            setTimeout(() => window.requestAnimationFrame(callback), 50);
        };

        window.requestAnimationFrame(callback);
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

    protected override _changeCoordX(deltaX: number): void {
        const prevLeft = parseInt(this.el.style.left);
        this.el.style.left = `${prevLeft + deltaX}px`;
        const newLeft = parseInt(this.el.style.left);

        this._coords$.next({
            ...this._coords$.value,
            left: newLeft,
            right: newLeft + this.el.offsetWidth - this.el.offsetWidth * this.visibleXRatio
        });
    }

    protected override _changeCoordY(deltaY: number = 0): void {
        const prevTop = parseInt(this.el.style.top);
        this.el.style.top = `${prevTop + deltaY}px`;
        const newTop = parseInt(this.el.style.top);

        const top = newTop;
        const bottom = newTop + this.el.offsetHeight;

        this._coords$.next({
            ...this._coords$.value,
            top: top + this.el.offsetHeight * this.visibleYRatio,
            bottom: top + this.el.offsetHeight - this.el.offsetHeight * this.visibleYRatio
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
