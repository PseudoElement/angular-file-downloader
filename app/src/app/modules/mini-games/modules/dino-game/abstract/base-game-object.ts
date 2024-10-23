import { BehaviorSubject, Observable } from 'rxjs';
import { ObjectCoords } from '../../../models/game-object-types';

export interface BaseGameObjectParams {
    startX: number;
    startY: number;
    width: string;
    height: string;
    imgSrc?: string;
}

export abstract class BaseGameObject {
    protected abstract _coords$: BehaviorSubject<ObjectCoords>;

    protected abstract get defaultImgSrc(): string;

    protected el!: HTMLDivElement;

    protected imgEl!: HTMLImageElement;

    constructor(private readonly params: BaseGameObjectParams, private readonly rootNode: HTMLElement) {
        this.create();
    }

    public getCoords$(): Observable<ObjectCoords> {
        return this._coords$.asObservable();
    }

    public destroy(): void {
        this.imgEl.remove();
        this.el.remove();
    }

    private create(): void {
        this.el = document.createElement('div')!;
        this.imgEl = document.createElement('img');

        this.setDefaultStyles();
        this.el.append(this.imgEl);
        this.rootNode.append(this.el);
    }

    private setDefaultStyles(): void {
        this.el.style.position = 'relative';
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
}
