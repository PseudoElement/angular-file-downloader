import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import { BehaviorSubject, debounceTime, filter, fromEvent, Subscription, takeUntil, takeWhile, tap } from 'rxjs';
import { PlayerAction, PlayerKeyboardAction } from '../abstract/game-objects-types';

type KeyCodes = {
    [key in PlayerKeyboardAction]: string;
};

@Injectable()
export class DinoGameControlsService {
    private readonly _keyCodes$ = new BehaviorSubject<KeyCodes>({
        jump: 'w',
        crawl: 's',
        moveRight: 'd',
        moveLeft: 'a',
        inactive: 'Escape'
    });

    private readonly _currAction$ = new BehaviorSubject<PlayerAction>('inactive');

    private get currAction(): PlayerAction {
        return this._currAction$.value;
    }

    private readonly subs: Subscription[] = [];

    private get keyCodes(): KeyCodes {
        return this._keyCodes$.value;
    }

    public listenKeyEvents(player: Player): void {
        const sub = fromEvent(window, 'keydown')
            .pipe(
                tap(console.log),
                debounceTime(10),
                filter((e: Event) => Object.values(this.keyCodes).includes((e as KeyboardEvent).key)),
                filter(() => this.currAction !== 'jump')
            )
            .subscribe(async (e) => {
                const keyboardEvent = e as KeyboardEvent;
                if (keyboardEvent.key === this.keyCodes.inactive) {
                    await this.inactive(player);
                }
                if (keyboardEvent.key === this.keyCodes.jump) {
                    if (this.currAction === 'crawl') {
                        await this.uncrawl(player);
                    } else {
                        await this.jump(player);
                    }
                }
                if (keyboardEvent.key === this.keyCodes.crawl) {
                    if (this.currAction === 'crawl') return;
                    await this.crawl(player);
                }
                if (keyboardEvent.key === this.keyCodes.moveLeft) {
                    await this.moveLeft(player);
                }
                if (keyboardEvent.key === this.keyCodes.moveRight) {
                    await this.moveRight(player);
                }
            });
        this.subs.push(sub);
    }

    public clearListeners(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private async jump(player: Player): Promise<void> {
        this._currAction$.next('jump');
        await player.doAction('jump');
        this._currAction$.next('inactiveRun');
        await player.doAction('inactiveRun');
    }

    private async crawl(player: Player): Promise<void> {
        this._currAction$.next('crawl');
        await player.doAction('crawl');
    }

    private async uncrawl(player: Player): Promise<void> {
        this._currAction$.next('uncrawl');
        await player.doAction('uncrawl');
    }

    private async moveLeft(player: Player): Promise<void> {
        this._currAction$.next('moveLeft');
        await player.doAction('moveLeft');
    }

    private async moveRight(player: Player): Promise<void> {
        this._currAction$.next('moveRight');
        await player.doAction('moveRight');
    }

    private async inactive(player: Player): Promise<void> {
        this._currAction$.next('inactive');
        await player.doAction('inactive');
    }
}
