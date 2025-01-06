import { Route, UrlSegment } from '@angular/router';
import { MINI_GAMES } from '../constants/mini-game-names';

export class MiniGameMatchers {
    public static async matchDinoGame(_route: Route, segments: UrlSegment[]): Promise<boolean> {
        const pathParam = segments[0].path;
        return pathParam === MINI_GAMES.DINO_GAME;
    }

    public static async matchFlappyBirdGame(_route: Route, segments: UrlSegment[]): Promise<boolean> {
        const pathParam = segments[0].path;
        return pathParam === MINI_GAMES.FLAPPY_BIRD;
    }

    public static async matchSeabattleGame(_route: Route, segments: UrlSegment[]): Promise<boolean> {
        const pathParam = segments[0].path;
        console.log();
        return pathParam === MINI_GAMES.SEA_BATTLE;
    }
}
