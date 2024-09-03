import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { GAMES } from '../constants/games';

@Injectable()
export class NavigationService {
    private readonly _games$ = new BehaviorSubject(GAMES);

    public readonly games$ = this._games$.asObservable();

    constructor(private readonly route: ActivatedRoute, private readonly router: Router) {
        this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => console.log(e.urlAfterRedirects));
    }
}
