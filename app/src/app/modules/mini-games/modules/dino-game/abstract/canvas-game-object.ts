import { GameObjectSpritesheetConfigs, SpriteAnimation } from '../models/spritesheet-types';
import { BaseGameObject, BaseGameObjectParams } from './base-game-object';

export abstract class CanvasGameObject extends BaseGameObject<HTMLCanvasElement> {
    protected spritesheet!: HTMLImageElement;

    private ctx!: CanvasRenderingContext2D;

    protected getCtx(): CanvasRenderingContext2D {
        return this.ctx;
    }

    protected abstract getSpriteConfig(): GameObjectSpritesheetConfigs;

    protected createImg(params: BaseGameObjectParams): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        this.ctx = canvas.getContext('2d')!;

        const width = parseInt(params.width);
        const height = parseInt(params.height);

        canvas.width = width;
        canvas.height = height;

        this.setCanvasStyles(canvas);

        return canvas;
    }

    protected draw(spriteName: SpriteAnimation, frameNum: number): void {
        const sprite = this.getSpriteConfig()[spriteName]!;
        const columnNum = frameNum % sprite.columns === 0 ? sprite.columns : frameNum % sprite.columns; // from 1
        const rowNum = Math.ceil(frameNum / sprite.columns); // from 1

        const offsetLeft = sprite.offsetLeft + (columnNum - 1) * sprite.imgWidth; // offset from left end to start sprite by X in png
        const offsetTop = sprite.offsetTop + (rowNum - 1) * sprite.imgHeight; // offset from top end to start sprite by Y in png
        const birdWidth = sprite.imgWidth; // width of bird in png
        const birdHeight = sprite.imgHeight; // height of bird in png
        const offsetLeftInCanvas = 0; // offset from left to draw in canvas
        const offsetTopInCanvas = 0; // offset from top to draw in canvas
        const canvasWidth = sprite.canvasWidth;
        const canvasHeight = sprite.canvasHeight;

        this.ctx.clearRect(offsetLeftInCanvas, offsetTopInCanvas, canvasWidth, canvasHeight);
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
    }

    /**
     *
     * @param spriteName key in images object to get images src
     * @param idx image's id in array
     * @param drawCallback Used if need to immediately draw after setting another img
     */
    protected loadSpriteImage(spriteName: SpriteAnimation, idx: number, drawCallback?: () => void): void {
        if (!this.images[spriteName]) throw new Error(`No sprites images for ${spriteName}`);

        const img = new Image();
        img.src = this.images[spriteName][idx];
        this.spritesheet = img;

        img.onload = () => {
            if (typeof drawCallback === 'function') {
                drawCallback();
            } else {
                // ON FIRST LOAD IMAGE
                const frameNum = idx + 1;
                this.draw(spriteName, frameNum);
            }
        };
    }

    protected abstract setCanvasStyles(canvas: HTMLCanvasElement): void;
}
