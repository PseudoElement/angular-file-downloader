import { GameObjectSpritesheetConfigs, ImagesForGameObject, LoadedImagesForGameObject, SpriteAnimation } from '../models/spritesheet-types';
import { BaseGameObject, BaseGameObjectParams } from './base-game-object';

export abstract class CanvasGameObject extends BaseGameObject<HTMLCanvasElement> {
    private spritesheets: LoadedImagesForGameObject = {
        die: [],
        inactive: [],
        jump: [],
        move: []
    };

    private ctx!: CanvasRenderingContext2D;

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

    /**
     *
     * @param spriteAnimation move
     * @param frameNum from 1 to last count of image in sprite.
     *  If for some animation on each step used different image (e.g. spriteIdx = 0) then frameNum should be 0.
     * @param spriteIdx index of image in imagesSrcs. Set to 0 by default,
     *  no need to cahnge if animation sprite list(move, jump, inactive, die) contains only 1 image
     */
    protected draw(spriteAnimation: SpriteAnimation, frameNum: number, spriteIdx: number = 0): void {
        const spriteImg = this.spritesheets[spriteAnimation]![spriteIdx];
        const spriteConfig = this.getSpriteConfig()[spriteAnimation]!;

        const columnNum = frameNum % spriteConfig.columns === 0 ? spriteConfig.columns : frameNum % spriteConfig.columns; // from 1
        const rowNum = Math.ceil(frameNum / spriteConfig.columns); // from 1

        const offsetLeft = spriteConfig.offsetLeft + (columnNum - 1) * spriteConfig.imgWidth; // offset from left end to start sprite by X in png
        const offsetTop = spriteConfig.offsetTop + (rowNum - 1) * spriteConfig.imgHeight; // offset from top end to start sprite by Y in png
        const birdWidth = spriteConfig.imgWidth; // width of bird in png
        const birdHeight = spriteConfig.imgHeight; // height of bird in png
        const offsetLeftInCanvas = 0; // offset from left to draw in canvas
        const offsetTopInCanvas = 0; // offset from top to draw in canvas
        const canvasWidth = spriteConfig.canvasWidth;
        const canvasHeight = spriteConfig.canvasHeight;

        this.ctx.clearRect(offsetLeftInCanvas, offsetTopInCanvas, canvasWidth, canvasHeight);
        this.ctx.drawImage(
            spriteImg,
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

    protected loadSprites(): void {
        for (const key in this.imagesSrcs) {
            const spriteAnimation = key as SpriteAnimation;
            const animationImages = this.imagesSrcs[spriteAnimation];
            if (!animationImages || !animationImages.length) continue;

            for (const imgSrc of animationImages) {
                const img = new Image();
                img.src = imgSrc;
                this.spritesheets[spriteAnimation]!.push(img);
            }
        }
    }

    protected abstract setCanvasStyles(canvas: HTMLCanvasElement): void;
}
