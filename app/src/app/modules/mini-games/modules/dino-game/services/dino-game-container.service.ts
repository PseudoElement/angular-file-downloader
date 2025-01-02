import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject, takeUntil, timer } from 'rxjs';
import { AbsObjectCoords } from '../../../models/game-object-types';
import { DYNO_CONTAINER_ID } from '../constants/common-consts';

@Injectable()
export class DinoGameContainerService {
    private _destroy$ = new Subject();

    public dinoDestroy$ = this._destroy$.asObservable();

    public readonly gameContainerCoords$ = new BehaviorSubject<AbsObjectCoords>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });

    constructor() {
        timer(1_000)
            .pipe(takeUntil(this.dinoDestroy$))
            .subscribe(() => this.setCoords());
        this.subOnWindowResize();
    }

    public onDestroy(): void {
        this._destroy$.next(null);
        this._destroy$.complete();
    }

    private subOnWindowResize(): void {
        fromEvent(window, 'resize')
            .pipe(takeUntil(this.dinoDestroy$))
            .subscribe(() => this.setCoords());
    }

    private setCoords(): void {
        const container = document.getElementById(DYNO_CONTAINER_ID)!;
        const rect = container.getBoundingClientRect();

        this.gameContainerCoords$.next({
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            right: rect.right + window.scrollX,
            left: rect.left + window.scrollX
        });
    }
}
