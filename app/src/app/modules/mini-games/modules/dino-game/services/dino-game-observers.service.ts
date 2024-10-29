import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    debounceTime,
    filter,
    first,
    firstValueFrom,
    forkJoin,
    fromEvent,
    interval,
    skipWhile,
    Subscription,
    switchMap,
    takeUntil,
    takeWhile,
    tap,
    throttleTime
} from 'rxjs';
import { PlayerAction, PlayerKeyboardAction } from '../abstract/game-objects-types';
import { wait } from 'src/app/utils/wait';
import { DinoGameService } from './dino-game.service';
import { BaseGameObject } from '../abstract/base-game-object';
import { DinoGameStateService } from './dino-game-state.service';

type KeyCodes = {
    [key in PlayerKeyboardAction]: string;
};

@Injectable()
export class DinoGameObservers {
    private readonly _keyCodes$ = new BehaviorSubject<KeyCodes>({
        jump: 'w',
        crawl: 's',
        moveRight: 'd',
        moveLeft: 'a',
        inactive: 'Escape'
    });

    private readonly _currActions$ = new BehaviorSubject<Set<PlayerAction>>(new Set(['inactive']));

    private get currActions(): Set<PlayerAction> {
        return this._currActions$.value;
    }

    private readonly subs: Subscription[] = [];

    private get keyCodes(): KeyCodes {
        return this._keyCodes$.value;
    }

    private get player(): Player {
        return this.gameStateSrv.player!;
    }

    constructor(private readonly gameStateSrv: DinoGameStateService) {}

    public listenKeyEvents(): void {
        const sub = fromEvent(window, 'keydown')
            .pipe(
                throttleTime(100),
                filter((e: Event) => Object.values(this.keyCodes).includes((e as KeyboardEvent).key)),
                filter(() => !this.currActions.has('jump'))
            )
            .subscribe(async (e) => {
                const keyboardEvent = e as KeyboardEvent;
                if (keyboardEvent.key === this.keyCodes.inactive) {
                    await this.inactive();
                }
                if (keyboardEvent.key === this.keyCodes.jump) {
                    if (this.currActions.has('crawl')) {
                        await this.uncrawl();
                    } else {
                        await this.jump();
                    }
                }
                if (keyboardEvent.key === this.keyCodes.crawl) {
                    if (this.currActions.has('crawl')) return;
                    await this.crawl();
                }
                if (keyboardEvent.key === this.keyCodes.moveLeft) {
                    await this.moveLeft();
                }
                if (keyboardEvent.key === this.keyCodes.moveRight) {
                    await this.moveRight();
                }
            });
        this.subs.push(sub);
    }

    public listenVisibilityChange(pause: () => void, play: () => void): void {
        fromEvent(document, 'visibilitychange').subscribe(() => {
            if (document.hidden) {
                pause();
            } else {
                play();
            }
        });
    }

    public listenGameObjectsCoords(): void {
        const sub = interval(1000)
            .pipe(
                switchMap(() => forkJoin([this.gameStateSrv.player$.pipe(first()), this.gameStateSrv.gameObjects$.pipe(first())])),
                skipWhile(() => !this.player),
                switchMap(([player, objects]) =>
                    forkJoin([firstValueFrom(player!.getCoords$()), ...objects.map((o) => firstValueFrom(o.getCoords$()))])
                )
            )
            .subscribe(([player]) => console.log(player));

        this.subs.push(sub);
    }

    public clearListeners(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private updateCurrActions(action: PlayerAction): void {
        if (action === 'inactiveRun' || action === 'inactive') {
            this.currActions.clear();
            this.currActions.add(action);
        } else if (action === 'jump' && this.currActions.has('crawl')) {
            this.currActions.delete('crawl');
        } else if (action === 'uncrawl') {
            this.currActions.delete('crawl');
        } else {
            this.currActions.add(action);
        }

        this._currActions$.next(this.currActions);
    }

    private async jump(): Promise<void> {
        this.updateCurrActions('jump');
        await this.player.doAction('jump');
        await wait(400);
        this.updateCurrActions('inactiveRun');
    }

    private async crawl(): Promise<void> {
        this.updateCurrActions('crawl');
        this.player.doAction('crawl');
    }

    private async uncrawl(): Promise<void> {
        this.updateCurrActions('uncrawl');
        this.player.doAction('uncrawl');
    }

    private async moveLeft(): Promise<void> {
        this.updateCurrActions('moveLeft');
        this.player.doAction('moveLeft');
    }

    private async moveRight(): Promise<void> {
        this.updateCurrActions('moveRight');
        this.player.doAction('moveRight');
    }

    private async inactive(): Promise<void> {
        this.updateCurrActions('inactive');
        this.player.doAction('inactive');
    }
}
