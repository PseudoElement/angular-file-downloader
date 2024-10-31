import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import { BehaviorSubject, filter, fromEvent, Subscription, throttleTime } from 'rxjs';
import { PlayerKeyboardAction } from '../abstract/game-objects-types';
import { DinoGameStateService } from './dino-game-state.service';

type KeyCodes = {
    [key in PlayerKeyboardAction]: string;
};

@Injectable()
export class DinoGameObservers {
    private readonly _keyBindings$ = new BehaviorSubject<KeyCodes>({
        jump: 'w',
        crawl: 's',
        moveRight: 'd',
        moveLeft: 'a',
        pause_unpause: 'Escape'
    });

    private readonly subs: Subscription[] = [];

    private get keyCodes(): KeyCodes {
        return this._keyBindings$.value;
    }

    private get player(): Player {
        return this.gameStateSrv.player!;
    }

    private isCrawling = false;

    constructor(private readonly gameStateSrv: DinoGameStateService) {}

    public listenKeyEvents(pause: () => void, play: () => void): void {
        const sub = fromEvent(window, 'keydown')
            .pipe(
                //@ts-ignore
                throttleTime(50),
                filter((e: KeyboardEvent) => Object.values(this.keyCodes).includes(e.key)),
                filter(
                    (e: KeyboardEvent) =>
                        this.gameStateSrv.isPlaying || (!this.gameStateSrv.isPlaying && e.key === this.keyCodes.pause_unpause)
                )
            )
            .subscribe(async (e) => {
                const keyboardEvent = e as KeyboardEvent;

                if (keyboardEvent.key === this.keyCodes.pause_unpause) {
                    if (this.gameStateSrv.isPlaying) {
                        this.inactive();
                        pause();
                    } else {
                        this.active();
                        play();
                    }
                }
                if (keyboardEvent.key === this.keyCodes.jump) {
                    if (this.isCrawling) {
                        this.uncrawl();
                    } else {
                        this.jump();
                    }
                }
                if (keyboardEvent.key === this.keyCodes.crawl) {
                    if (this.isCrawling) return;
                    this.crawl();
                }
                if (keyboardEvent.key === this.keyCodes.moveLeft) {
                    this.moveLeft();
                }
                if (keyboardEvent.key === this.keyCodes.moveRight) {
                    this.moveRight();
                }
            });

        this.subs.push(sub);
    }

    public listenVisibilityChange(pause: () => void): void {
        fromEvent(document, 'visibilitychange').subscribe(() => {
            if (document.hidden) {
                // pause();
            }
        });
    }

    public listenGameObjectsCoords(): void {
        // const sub = interval(1000)
        //     .pipe(
        //         switchMap(() => forkJoin([this.gameStateSrv.player$.pipe(first()), this.gameStateSrv.gameObjects$.pipe(first())])),
        //         skipWhile(() => !this.player),
        //         switchMap(([player, objects]) =>
        //             forkJoin([firstValueFrom(player!.getCoords$()), ...objects.map((o) => firstValueFrom(o.getCoords$()))])
        //         )
        //     )
        //     .subscribe();
        // this.subs.push(sub);
        // this.player.getCoords$().subscribe((c) => console.log(`top = ${c.topY}, bottom = ${c.bottomY}, visible = ${c.visibleTopY}`));
    }

    public clearListeners(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private jump(): void {
        this.player.doAction('jump');
    }

    private crawl(): void {
        this.isCrawling = true;
        this.player.doAction('crawl');
    }

    private uncrawl(): void {
        this.isCrawling = false;
        this.player.doAction('uncrawl');
    }

    private moveLeft(): void {
        this.player.doAction('moveLeft');
    }

    private moveRight(): void {
        this.player.doAction('moveRight');
    }

    private inactive(): void {
        this.player.doAction('inactive');
    }

    private active(): void {
        this.player.doAction('inactiveRun');
    }
}
