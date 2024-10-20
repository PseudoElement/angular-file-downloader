import { defaultIfEmpty, firstValueFrom, Observable, pairwise, startWith } from 'rxjs';
import { ActionType, ActiveObject } from '../abstract/game-objects-types';
import { BaseGameObject, BaseGameObjectParams } from '../abstract/base-game-object';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';
import { wait } from 'src/app/utils/wait';
import { Difficulty } from '../models/animation-types';

export class Player extends BaseGameObject implements ActiveObject {
    public currAction: ActionType = 'inactive';

    private readonly initialOffsetTop: number;

    private delay: number = 100;

    protected get defaultImgSrc(): string {
        return '../../../../../../assets/dino-game/png/Idle (1).png';
    }

    constructor(params: BaseGameObjectParams, private readonly difficulty$: Observable<Difficulty>) {
        const rootNode = document.getElementById(DYNO_CONTAINER_ID)!;
        super(params, rootNode);

        this.initialOffsetTop = params.startY - 100;
    }

    public async doAction(action: ActionType): Promise<void> {
        this.currAction = action;

        if (action === 'moveRightFast') await this.moveRightFast();
        if (action === 'moveRightSlow') await this.moveRightSlow();
        if (action === 'moveUp') await this.moveUp();
        if (action === 'moveDown') await this.moveDown();
        if (action === 'die') return;
        if (action === 'inactive') await this.inactive();
    }

    public async jump(): Promise<void> {
        const [prev, curr] = await firstValueFrom(this.difficulty$.pipe(pairwise(), startWith([1, 1]), defaultIfEmpty([1, 1])));
        if (prev !== curr) {
            this.delay = 100 - 6 * curr;
            this.el.style.transition = `all ${this.delay}ms`;
        }

        await this.doAction('moveUp');
        await this.doAction('moveDown');
    }

    public _changeCoordX(deltaX: number): void {
        throw new Error('Method not implemented.');
    }

    public _changeCoordY(deltaY: number): void {
        this.el.style.top = `${this.initialOffsetTop + deltaY}px`;
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
            while (this.currAction === 'moveRightFast') {
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
            while (this.currAction === 'moveRightSlow') {
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
            '../../../../../../assets/dino-game/png/Jump (6).png',
            '../../../../../../assets/dino-game/png/Jump (7).png'
        ] as const;

        for (const img of imgs) {
            this.changeImg(img);
            this._changeCoordY(-100);
            await wait(this.delay);
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
            this._changeCoordY(100);
            await wait(this.delay);
        }
    }

    private async die(): Promise<void> {}

    private async inactive(): Promise<void> {
        this.changeImg('../../../../../../assets/dino-game/png/Idle (1).png');
    }
}
