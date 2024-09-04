import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatestWith, map, Observable, share } from 'rxjs';
import { Game, GAMES } from '../constants/games';

@Injectable()
export class NavigationService {
    private readonly _games$ = new BehaviorSubject<Game[]>(GAMES);

    public getFilteredGames$(route: ActivatedRoute): Observable<Game[]> {
        return this._games$.pipe(
            combineLatestWith(route.params),
            map(([games, params]: [Game[], { [k: string]: string }]) => {
                if (params['id']) {
                    return games.filter((game) => game.id === params['id']);
                }
                return games;
            }),
            share(),
            takeUntilDestroyed()
        );
    }
}
