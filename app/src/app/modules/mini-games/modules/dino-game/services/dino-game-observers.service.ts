import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import { BehaviorSubject, debounceTime, filter, fromEvent, Subscription, takeUntil, takeWhile, tap, throttleTime } from 'rxjs';
import { PlayerAction, PlayerKeyboardAction } from '../abstract/game-objects-types';
import { wait } from 'src/app/utils/wait';
import { DinoGameService } from './dino-game.service';

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

    public listenKeyEvents(player: Player): void {
        const sub = fromEvent(window, 'keydown')
            .pipe(
                throttleTime(100),
                filter((e: Event) => Object.values(this.keyCodes).includes((e as KeyboardEvent).key)),
                filter(() => !this.currActions.has('jump'))
            )
            .subscribe(async (e) => {
                const keyboardEvent = e as KeyboardEvent;
                if (keyboardEvent.key === this.keyCodes.inactive) {
                    await this.inactive(player);
                }
                if (keyboardEvent.key === this.keyCodes.jump) {
                    if (this.currActions.has('crawl')) {
                        await this.uncrawl(player);
                    } else {
                        await this.jump(player);
                    }
                }
                if (keyboardEvent.key === this.keyCodes.crawl) {
                    if (this.currActions.has('crawl')) return;
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

    public listenVisibilityChange(pause: () => void, play: () => Promise<void>): void {
        fromEvent(document, 'visibilitychange').subscribe(async () => {
            console.log('document.hidden', document.hidden);
            if (document.hidden) pause();
            else await play();
        });
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

    private async jump(player: Player): Promise<void> {
        this.updateCurrActions('jump');
        await player.doAction('jump');
        await wait(400);
        this.updateCurrActions('inactiveRun');
    }

    private async crawl(player: Player): Promise<void> {
        this.updateCurrActions('crawl');
        await player.doAction('crawl');
    }

    private async uncrawl(player: Player): Promise<void> {
        this.updateCurrActions('uncrawl');
        await player.doAction('uncrawl');
    }

    private async moveLeft(player: Player): Promise<void> {
        this.updateCurrActions('moveLeft');
        await player.doAction('moveLeft');
    }

    private async moveRight(player: Player): Promise<void> {
        this.updateCurrActions('moveRight');
        await player.doAction('moveRight');
    }

    private async inactive(player: Player): Promise<void> {
        this.updateCurrActions('inactive');
        await player.doAction('inactive');
    }
}
