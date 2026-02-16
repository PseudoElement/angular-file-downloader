import { Injectable } from '@angular/core';
import { fromEvent, map, Observable, shareReplay, Subject, switchMap, tap } from 'rxjs';

export type Dimension = 'desktop' | 'tablet' | 'mobile';

@Injectable({
    providedIn: 'root'
})
export class ViewportService {
    private readonly _dimension$ = new Subject<Dimension>();

    public readonly dimension$: Observable<Dimension> = this._dimension$.asObservable();

    public init(): void {
        this._dimension$.next(this.defineDimension());
        fromEvent(window, 'resize')
            .pipe(map(() => this.defineDimension()))
            .subscribe((dimension) => this._dimension$.next(dimension));
    }

    private defineDimension(): Dimension {
        return window.innerWidth > 1024 ? 'desktop' : window.innerWidth > 768 ? 'tablet' : 'mobile';
    }
}
