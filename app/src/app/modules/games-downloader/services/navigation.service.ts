import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatestWith, map, Observable, share } from 'rxjs';
import { GameUiInfo, GAMES } from '../constants/games';

@Injectable()
export class NavigationService {
    private readonly _games$ = new BehaviorSubject<GameUiInfo[]>(GAMES);

    public getFilteredGames$(route: ActivatedRoute): Observable<GameUiInfo[]> {
        return this._games$.pipe(
            combineLatestWith(route.params),
            map(([games, params]: [GameUiInfo[], { [k: string]: string }]) => {
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
