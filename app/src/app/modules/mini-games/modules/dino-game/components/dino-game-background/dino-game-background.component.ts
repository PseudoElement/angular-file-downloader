import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { DinoGameService } from '../../services/dino-game.service';
import { DinoGameStateService } from '../../services/dino-game-state.service';
import { map, Observable, tap } from 'rxjs';
import { MenuButtonType, MenuState } from 'src/app/shared/components/game-menu/constants/buttons';

@Component({
    selector: 'app-dino-game-background',
    templateUrl: './dino-game-background.component.html',
    styleUrl: './dino-game-background.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinoGameBackgroundComponent implements OnDestroy {
    constructor(private readonly dinoGameSrv: DinoGameService, private readonly gameStateSrv: DinoGameStateService) {}

    ngOnDestroy(): void {
        this.dinoGameSrv.endGame();
    }

    public readonly bgAnimation$ = this.gameStateSrv.gameState$.pipe(
        map((state) => (!state.isPlaying ? 'inactive' : `active-difficulty-${state.difficulty}`))
    );

    public readonly bestResults$ = this.gameStateSrv.bestResults$;

    public readonly menuState$: Observable<MenuState> = this.gameStateSrv.gameState$.pipe(
        map((state) => {
            if (state.isPlaying) {
                return 'hidden';
            } else {
                if (state.isStarted && !state.isKilled) return 'pause';
                if (state.isKilled) return 'restart';
                return 'start';
            }
        })
    );

    public readonly timeMs$ = this.gameStateSrv.gameState$.pipe(map((state) => state.time));

    public readonly difficulty$ = this.gameStateSrv.gameState$.pipe(map((state) => state.difficulty));

    public readonly score$ = this.gameStateSrv.gameState$.pipe(map((state) => state.score));

    public pause(): void {
        this.dinoGameSrv.pauseGame();
    }

    public handleMenuBtnClick(btnType: MenuButtonType): void {
        if (btnType === 'continue') {
            this.dinoGameSrv.unpauseGame();
        } else if (btnType === 'start') {
            this.dinoGameSrv.startGame();
        } else if (btnType === 'restart') {
            this.dinoGameSrv.restartGame();
        } else if (btnType === 'end') {
            this.dinoGameSrv.endGame();
        } else if (btnType === 'controls') {
        }
    }
}
