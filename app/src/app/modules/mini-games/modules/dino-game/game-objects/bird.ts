import { BehaviorSubject } from 'rxjs';
import { GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { AnimatedObject, BirdAction, MobileObject } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DinoGameState } from '../models/common';
import { BirdAnimation, Difficulty } from '../models/animation-types';
import { SpriteSheetConf } from '../models/spritesheet-types';
import { DIFFICULTY_CONFIG } from '../constants/main-config';

export class Bird extends BaseGameObject<HTMLCanvasElement> implements MobileObject<BirdAction>, AnimatedObject<BirdAnimation> {
    private spritesheet!: HTMLImageElement;

    private ctx!: CanvasRenderingContext2D;

    protected config: SpriteSheetConf = {
        columns: 4,
        rows: 2,
        count: 8,
        imgHeight: 100,
        imgWidth: 150,
        offsetLeft: 0,
        offsetTop: 200
    };

    protected readonly _coords$: BehaviorSubject<RelObjectCoords>;

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/bird/FlyingGameCharacter.png';
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

        const left = parseFloat(this.el.style.left);
        const top = parseFloat(this.el.style.top);

        this._coords$ = new BehaviorSubject<RelObjectCoords>({
            leftX: left,
            topY: top,
            rightX: left + this.el.offsetWidth,
            bottomY: top + this.el.offsetHeight,
            visibleTopY: top + this.el.offsetHeight,
            visibleRightX: left + this.el.offsetWidth
        });

        this.animate('fly');
        this.move('moveLeft');
    }

    public animate(_animation: BirdAnimation): void {
        let frameNum = 1;

        const callback = () => {
            if (this.isDestroyed || !this.isPlaying) return;
            this.draw(frameNum);

            if (frameNum < this.config.count) frameNum++;
            else frameNum = 1;

            setTimeout(() => {
                window.requestAnimationFrame(callback);
            }, 100);
        };

        window.requestAnimationFrame(callback);
    }

    private draw(frameNum: number): void {
        const columnNum = frameNum % this.config.columns === 0 ? this.config.columns : frameNum % this.config.columns; // from 1
        const rowNum = Math.ceil(frameNum / this.config.columns); // from 1

        const offsetLeft = this.config.offsetLeft + (columnNum - 1) * this.config.imgWidth;
        const offsetTop = this.config.offsetTop + (rowNum - 1) * this.config.imgHeight;

        this.ctx.clearRect(0, 0, 100, 75);
        this.ctx.drawImage(this.spritesheet, offsetLeft, offsetTop, this.config.imgWidth, this.config.imgHeight, 0, 0, 100, 75);
    }

    public override needDestroy(): boolean {
        return this.checkEnds().isLeftEnd;
    }

    public move(_action: BirdAction): void {
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

    protected createImg(params: BaseGameObjectParams): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        this.ctx = canvas.getContext('2d')!;

        const width = parseInt(params.width);
        const height = parseInt(params.height);

        canvas.width = width;
        canvas.height = height;
        canvas.style.transform = `rotateY(180deg)`;
        this.loadSpriteImage(params);

        return canvas;
    }

    private _changeCoordX(deltaX: number): void {
        const prevLeft = parseInt(this.el.style.left);
        this.el.style.left = `${prevLeft + deltaX}px`;
        const newLeft = parseInt(this.el.style.left);

        this._coords$.next({
            ...this._coords$.value,
            leftX: newLeft,
            rightX: newLeft + this.el.offsetWidth,
            visibleRightX: newLeft + this.el.offsetWidth
        });
    }

    private _changeCoordY(deltaY: number = 0): void {
        const prevTop = parseInt(this.el.style.top);
        this.el.style.top = `${prevTop + deltaY}px`;
        const newTop = parseInt(this.el.style.top);

        this._coords$.next({
            ...this._coords$.value,
            topY: newTop,
            bottomY: newTop + this.el.offsetHeight,
            visibleTopY: newTop
        });
    }

    private loadSpriteImage(params: BaseGameObjectParams): void {
        const img = new Image();
        img.src = this.defaultImgSrc;
        this.spritesheet = img;

        img.onload = () => {
            const offsetLeft = this.config.offsetLeft; // offset from left end to start sprite by X in png
            const offsetTop = this.config.offsetTop; // offset from top end to start sprite by Y in png
            const birdWidth = this.config.imgWidth; // width of bird in png
            const birdHeight = this.config.imgHeight; // height of bird in png
            const offsetLeftInCanvas = 0; // offset from left to draw in canvas
            const offsetTopInCanvas = 0; // offset from top to draw in canvas
            const canvasWidth = 100;
            const canvasHeight = 75;

            // Draw the first sprite at (0, 300) on the sprite sheet
            this.ctx.drawImage(
                this.spritesheet,
                offsetLeft,
                offsetTop,
                birdWidth,
                birdHeight,
                offsetLeftInCanvas,
                offsetTopInCanvas,
                canvasWidth,
                canvasHeight
            );
        };
    }
}
