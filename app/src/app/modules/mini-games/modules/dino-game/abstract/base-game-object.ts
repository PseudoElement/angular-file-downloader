import { BehaviorSubject, Observable } from 'rxjs';
import { AbsObjectCoords, GameContainerInfo, RelObjectCoords } from '../../../models/game-object-types';
import { ContainerEnds } from '../models/common';

export interface BaseGameObjectParams {
    startX: number;
    startY: number;
    width: string;
    height: string;
    imgSrc?: string;
}

export abstract class BaseGameObject {
    protected abstract _coords$: BehaviorSubject<RelObjectCoords>;

    protected abstract get defaultImgSrc(): string;

    protected el!: HTMLDivElement;

    protected imgEl!: HTMLImageElement;

    public isDestroyed: boolean = false;

    private get absContainerCoords(): AbsObjectCoords {
        return this.containerInfo.coords$.value;
    }

    constructor(
        private readonly params: BaseGameObjectParams,
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

    private create(): void {
        this.el = document.createElement('div')!;
        this.imgEl = document.createElement('img');

        this.setDefaultStyles();
        this.el.append(this.imgEl);
        this.rootNode.append(this.el);
    }

    private setDefaultStyles(): void {
        this.el.style.position = 'absolute';
        this.el.style.top = `${this.params.startY}px`;
        this.el.style.left = `${this.params.startX}px`;
        this.el.style.transition = 'all 100ms';
        this.el.style.width = this.params.width;
        this.el.style.height = this.params.height;

        this.imgEl.style.width = this.params.width;
        this.imgEl.style.height = this.params.height;
        this.changeImg(this.params.imgSrc || this.defaultImgSrc);
    }

    protected changeImg(imgSrc: string): void {
        this.imgEl.setAttribute('src', imgSrc);
    }

    protected checkEnds(): ContainerEnds {
        const elAbsCoords = this.getAbsoluteCoords();
        const ends = {
            isLeftEnd: elAbsCoords.left <= this.absContainerCoords.left + 50,
            isRightEnd: elAbsCoords.right >= this.absContainerCoords.right - 50,
            isTopEnd: elAbsCoords.top <= this.absContainerCoords.top + 10,
            isBottomEnd: elAbsCoords.bottom >= this.absContainerCoords.bottom - 10
        } as ContainerEnds;

        return ends;
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
