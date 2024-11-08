import { BehaviorSubject, Observable } from 'rxjs';
import { AbsObjectCoords, GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { ContainerEnds } from '../models/common';
import { GameObjectType } from '../constants/game-objects';
import { ImagesForGameObject } from '../models/spritesheet-types';

export interface BaseGameObjectParams {
    left: string;
    top: string;
    width: string;
    height: string;
    imgSrc?: string;
}

export type ImageType = HTMLImageElement | HTMLCanvasElement;

export abstract class BaseGameObject<T extends ImageType = ImageType> {
    public abstract type: GameObjectType;

    protected abstract _coords$: BehaviorSubject<RelObjectCoords>;

    protected abstract imagesSrcs: ImagesForGameObject;

    protected el!: HTMLDivElement;

    protected imgEl!: T;

    public isDestroyed: boolean = false;

    private get absContainerCoords(): AbsObjectCoords {
        return this.containerInfo.coords$.value;
    }

    constructor(
        protected readonly params: BaseGameObjectParams,
        private readonly containerInfo: GameContainerInfo,
        private readonly rootNode: HTMLElement
    ) {
        this.create();
    }

    public getCoords$(): Observable<RelObjectCoords> {
        return this._coords$.asObservable();
    }

    public destroy(): void {
        this.imgEl.remove();
        this.el.remove();
        this.isDestroyed = true;
    }

    public abstract needDestroy(): boolean;

    private create(): void {
        this.el = document.createElement('div')!;
        this.imgEl = this.createImg(this.params);
        this.setDefaultStyles();

        this.el.append(this.imgEl);
        this.rootNode.append(this.el);
    }

    protected abstract createImg(params: BaseGameObjectParams): T;

    private setDefaultStyles(): void {
        this.el.style.position = 'absolute';
        this.el.style.top = this.params.top;
        this.el.style.left = this.params.left;
        this.el.style.transition = 'all 100ms';
        this.el.style.width = this.params.width;
        this.el.style.height = this.params.height;
        // this.el.style.border = '2px solid blue';
    }

    protected changeImg(imgSrc: string): void {
        this.imgEl.setAttribute('src', imgSrc);
    }

    protected checkEnds(): ContainerEnds {
        const elAbsCoords = this.getAbsoluteCoords();
        const ends = {
            isLeftEnd: elAbsCoords.left <= this.absContainerCoords.left + 20,
            isRightEnd: elAbsCoords.right >= this.absContainerCoords.right - 20,
            isTopEnd: elAbsCoords.top <= this.absContainerCoords.top + 10,
            isBottomEnd: elAbsCoords.bottom >= this.absContainerCoords.bottom - 10
        } as ContainerEnds;

        return ends;
    }

    protected _changeCoordX(deltaX: number): void {
        const prevLeft = parseInt(this.el.style.left);
        this.el.style.left = `${prevLeft + deltaX}px`;
        const newLeft = parseInt(this.el.style.left);

        this._coords$.next({
            ...this._coords$.value,
            left: newLeft,
            right: newLeft + this.el.offsetWidth
        });
    }

    protected _changeCoordY(deltaY: number = 0): void {
        const prevTop = parseInt(this.el.style.top);
        this.el.style.top = `${prevTop + deltaY}px`;
        const newTop = parseInt(this.el.style.top);

        this._coords$.next({
            ...this._coords$.value,
            top: newTop,
            bottom: newTop + this.el.offsetHeight
        });
    }

    private getAbsoluteCoords(): AbsObjectCoords {
        const rect = this.el.getBoundingClientRect();

        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }
}
