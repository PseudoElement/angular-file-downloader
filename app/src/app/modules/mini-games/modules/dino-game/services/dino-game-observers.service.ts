import { Injectable } from '@angular/core';
import { Player } from '../game-objects/player';
import { combineLatest, combineLatestWith, filter, fromEvent, map, Subscription, switchMap, takeWhile, throttleTime } from 'rxjs';
import { isFarmableObject } from '../models/game-objects-types';
import { DinoGameStateService } from './dino-game-state.service';
import { RelObjectCoords } from '../../../models/game-object-types';
import { BaseGameObject } from '../abstract/base-game-object';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { DinoGameSettingsService } from './dino-game-settings.service';
import { KeysBindings } from '../models/key-bindings-types';

interface PlayerCollisionData {
    coords: RelObjectCoords;
}

interface CollisionData extends PlayerCollisionData {
    object: BaseGameObject;
}

@Injectable()
export class DinoGameObservers {
    private readonly subs: Subscription[] = [];

    private get keyCodes(): KeysBindings {
        return this.gameSettingsSrv.keyBindings;
    }

    private get player(): Player {
        return this.gameStateSrv.player!;
    }

    private isCrawling = false;

    constructor(
        private readonly gameStateSrv: DinoGameStateService,
        private readonly localStorageSrv: LocalStorageService,
        private readonly gameSettingsSrv: DinoGameSettingsService
    ) {}

    public listenKeyEvents(pause: () => void, play: () => void): void {
        const sub = fromEvent(window, 'keydown')
            .pipe(
                //@ts-ignore
                throttleTime(50),
                filter((e: KeyboardEvent) =>
                    Object.values(this.keyCodes)
                        .map((el) => el.value)
                        .includes(e.code)
                ),
                filter((e: KeyboardEvent) => this.gameStateSrv.isPlaying)
            )
            .subscribe((e: KeyboardEvent) => {
                if (e.code === this.keyCodes.pause_unpause.value) {
                    if (this.gameStateSrv.isPlaying) {
                        pause();
                    } else {
                        this.active();
                        play();
                    }
                }
                if (e.code === this.keyCodes.jump.value) {
                    if (this.isCrawling) {
                        this.uncrawl();
                    } else {
                        this.jump();
                    }
                }
                if (e.code === this.keyCodes.crawl.value) {
                    if (this.isCrawling) return;
                    this.crawl();
                }
                if (e.code === this.keyCodes.moveLeft.value) {
                    this.moveLeft();
                }
                if (e.code === this.keyCodes.moveRight.value) {
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
                        player!.getCoords$().pipe(map((coords) => ({ coords }))),
                        ...objects.map((o) =>
                            o.getCoords$().pipe(
                                map((coords) => ({ coords, object: o })),
                                takeWhile(() => !o.isDestroyed)
                            )
                        )
                    ])
                ),
                throttleTime(50)
            )
            .subscribe(([player, ...objects]) => {
                const touched = this.checkPlayerTouchObject(player, objects);
                if (!touched) return;

                if (isFarmableObject(touched.object)) {
                    this.player.farm(touched.object);
                    this.gameStateSrv.deleteGameObjects(false);
                } else {
                    this.gameStateSrv.changeGameState({ isKilled: true, isPlaying: false });
                    this.player.animate('die');
                    this.updateGameResultsOnEnd();
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

    private checkPlayerTouchObject(player: PlayerCollisionData, objects: CollisionData[]): CollisionData | null {
        for (const gameObject of objects) {
            const isTouched =
                player.coords.left < gameObject.coords.right &&
                player.coords.right > gameObject.coords.left &&
                player.coords.top < gameObject.coords.bottom &&
                player.coords.bottom > gameObject.coords.top;

            if (isTouched) return gameObject;
        }

        return null;
    }

    private updateGameResultsOnEnd(): void {
        const bestScore = this.localStorageSrv.get('bestScore');
        const bestTime = this.localStorageSrv.get('bestTime');

        if (!bestScore || parseInt(bestScore) < this.gameStateSrv.score) {
            this.localStorageSrv.set('bestScore', this.gameStateSrv.score);
        }

        if (!bestTime || parseInt(bestTime) < this.gameStateSrv.time) {
            this.localStorageSrv.set('bestTime', this.gameStateSrv.time);
        }
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

    private active(): void {
        this.player.doAction('inactiveRun');
    }
}
