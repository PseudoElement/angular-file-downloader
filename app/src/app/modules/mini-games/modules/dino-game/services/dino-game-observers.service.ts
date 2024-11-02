import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    filter,
    fromEvent,
    map,
    Subscription,
    switchMap,
    takeWhile,
    throttleTime
} from 'rxjs';
import { PlayerKeyboardAction } from '../models/game-objects-types';
import { DinoGameStateService } from './dino-game-state.service';
import { RelObjectCoords } from '../../../models/game-object-types';
import { GameObjectType } from '../constants/game-objects';

type KeyCodes = {
    [key in PlayerKeyboardAction]: string;
};

interface CollisionData {
    coords: RelObjectCoords;
    type: GameObjectType;
}

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
                        this.gameStateSrv.isPlaying ||
                        (!this.gameStateSrv.isPlaying && !this.gameStateSrv.isKilled && e.key === this.keyCodes.pause_unpause)
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
                pause();
            }
        });
    }

    public listenGameObjectsCoords(pause: () => void): void {
        const sub = this.gameStateSrv.player$
            .pipe(
                combineLatestWith(this.gameStateSrv.gameObjects$),
                switchMap(([player, objects]) =>
                    combineLatest([
                        player!.getCoords$().pipe(map((coords) => ({ coords, type: player!.type }))),
                        ...objects.map((o) =>
                            o.getCoords$().pipe(
                                map((coords) => ({ coords, type: o.type })),
                                takeWhile(() => !o.isDestroyed)
                            )
                        )
                    ])
                ),
                throttleTime(50)
            )
            .subscribe(([player, ...objects]) => {
                if (this.checkPlayerDied(player, objects)) {
                    this.gameStateSrv.changeGameState({ isKilled: true, isPlaying: false });
                    this.player.animate('die');
                    pause();
                }
            });

        this.subs.push(sub);
    }

    public setIsCrawling(bool: boolean): void {
        this.isCrawling = bool;
    }

    public clearListeners(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private checkPlayerDied(player: CollisionData, objects: CollisionData[]): boolean {
        for (const gameObject of objects) {
            const isKilled =
                player.coords.left < gameObject.coords.right &&
                player.coords.right > gameObject.coords.left &&
                player.coords.top < gameObject.coords.bottom &&
                player.coords.bottom > gameObject.coords.top;

            if (isKilled) return true;
        }

        return false;
    }

    private jump(): void {
        this.player.doAction('jump');
    }

    private crawl(): void {
        this.setIsCrawling(true);
        this.player.doAction('crawl');
    }

    private uncrawl(): void {
        this.setIsCrawling(false);
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
