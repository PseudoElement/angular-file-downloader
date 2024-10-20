import { Observable } from 'rxjs';
import { AnimationType, MobileAnimatedObj } from '../abstract/game-objects-types';
import { Difficulty } from '../models/animation-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { wait } from 'src/app/utils/wait';

export class Player extends BaseGameObject implements MobileAnimatedObj {
    public currAnimation: AnimationType = 'inactive';

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/png/Idle (1).png';
    }

    constructor(params: BaseGameObjectParams, private readonly difficulty$: Observable<Difficulty>) {
        const rootNode = document.getElementById(DYNO_CONTAINER_ID)!;
        super(params, rootNode);
    }

    public async animate(animation: AnimationType): Promise<void> {
        this.currAnimation = animation;

        if (animation === 'moveRightFast') await this.moveRightFast();
        if (animation === 'moveRightSlow') await this.moveRightSlow();
        if (animation === 'moveUp') await this.moveUp();
        if (animation === 'moveDown') await this.moveDown();
        if (animation === 'die') return;
        if (animation === 'inactive') await this.inactive();
    }

    public async jump(): Promise<void> {
        this.currAnimation = 'moveUp';
        await this.moveUp();

        this.currAnimation = 'moveDown';
        await this.moveDown();
    }

    public changeCoordX(): void {
        throw new Error('Method not implemented.');
    }

    public changeCoordY(): void {
        throw new Error('Method not implemented.');
    }

    private async moveRightFast(): Promise<void> {
        const imgs = [
            '../../../../../../assets/dino-game/png/Run (1).png',
            '../../../../../../assets/dino-game/png/Run (2).png',
            '../../../../../../assets/dino-game/png/Run (3).png',
            '../../../../../../assets/dino-game/png/Run (4).png',
            '../../../../../../assets/dino-game/png/Run (5).png',
            '../../../../../../assets/dino-game/png/Run (6).png',
            '../../../../../../assets/dino-game/png/Run (7).png',
            '../../../../../../assets/dino-game/png/Run (8).png'
        ] as const;

        (async () => {
            while (this.currAnimation === 'moveRightFast') {
                for (const img of imgs) {
                    this.changeImg(img);
                    await wait(50);
                }
            }
        })();
    }

    private async moveRightSlow(): Promise<void> {
        const imgs = [
            '../../../../../../assets/dino-game/png/Walk (1).png',
            '../../../../../../assets/dino-game/png/Walk (2).png',
            '../../../../../../assets/dino-game/png/Walk (3).png',
            '../../../../../../assets/dino-game/png/Walk (4).png',
            '../../../../../../assets/dino-game/png/Walk (5).png',
            '../../../../../../assets/dino-game/png/Walk (6).png',
            '../../../../../../assets/dino-game/png/Walk (7).png',
            '../../../../../../assets/dino-game/png/Walk (8).png',
            '../../../../../../assets/dino-game/png/Walk (9).png',
            '../../../../../../assets/dino-game/png/Walk (10).png'
        ] as const;

        (async () => {
            while (this.currAnimation === 'moveRightSlow') {
                for (const img of imgs) {
                    this.changeImg(img);
                    await wait(100);
                }
            }
        })();
    }

    private async moveUp(): Promise<void> {
        const imgs = [
            '../../../../../../assets/dino-game/png/Jump (2).png',
            '../../../../../../assets/dino-game/png/Jump (3).png',
            '../../../../../../assets/dino-game/png/Jump (4).png',
            '../../../../../../assets/dino-game/png/Jump (5).png',
            '../../../../../../assets/dino-game/png/Jump (6).png',
            '../../../../../../assets/dino-game/png/Jump (7).png'
        ] as const;

        for (const img of imgs) {
            this.changeImg(img);
            await wait(100);
        }
    }

    private async moveDown(): Promise<void> {
        const imgs = [
            '../../../../../../assets/dino-game/png/Jump (10).png',
            '../../../../../../assets/dino-game/png/Jump (11).png',
            '../../../../../../assets/dino-game/png/Jump (12).png',
            '../../../../../../assets/dino-game/png/Jump (4).png',
            '../../../../../../assets/dino-game/png/Jump (2).png'
        ] as const;

        for (const img of imgs) {
            this.changeImg(img);
            await wait(100);
        }
    }

    private async die(): Promise<void> {}

    private async inactive(): Promise<void> {
        this.changeImg('../../../../../../assets/dino-game/png/Idle (1).png');
    }
}
