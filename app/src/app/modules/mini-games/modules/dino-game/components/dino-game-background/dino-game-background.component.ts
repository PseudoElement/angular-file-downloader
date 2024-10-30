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

    public readonly bgAnimation$ = this.dinoGameSrv.bgAnimationStyle$;

    public readonly menuState$: Observable<MenuState> = this.gameStateSrv.gameState$.pipe(
        map((state) => {
            if (state.isPlaying) {
                return 'hidden';
            } else {
                console.log(state.time > 0);
                if (state.time > 0) return 'pause';
                if (state.isKilled) return 'restart';
                return 'start';
            }
        }),
        tap(console.log)
    );

    public handleMenuBtnClick(btnType: MenuButtonType): void {
        if (btnType === 'continue') {
            this.dinoGameSrv.unpauseGame();
        } else if (btnType === 'start') {
            this.dinoGameSrv.startGame();
        }
    }
}
