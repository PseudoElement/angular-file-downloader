import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DinoGameService } from '../../services/dino-game.service';
import { DinoGameStateService } from '../../services/dino-game-state.service';
import { map, Observable } from 'rxjs';
import { MenuButtonType, MenuState } from 'src/app/shared/components/game-menu/constants/buttons';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import {
    GameSettingsModalComponent,
    SettingsReturnedValue
} from 'src/app/shared/components/game-settings-modal/game-settings-modal.component';
import { DinoGameSettingsService } from '../../services/dino-game-settings.service';
import { DinoGameContainerService } from '../../services/dino-game-container.service';

@Component({
    selector: 'app-dino-game-background',
    templateUrl: './dino-game-background.component.html',
    styleUrl: './dino-game-background.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DinoGameBackgroundComponent implements OnDestroy {
    constructor(
        private readonly dinoGameSrv: DinoGameService,
        private readonly gameStateSrv: DinoGameStateService,
        private readonly gameSettingsSrv: DinoGameSettingsService,
        private readonly gameContainerSrv: DinoGameContainerService,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    ngOnDestroy(): void {
        this.dinoGameSrv.endGame();
        this.gameContainerSrv.onDestroy();
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

    public async handleMenuBtnClick(btnType: MenuButtonType): Promise<void> {
        if (btnType === 'continue') {
            this.dinoGameSrv.unpauseGame();
        } else if (btnType === 'start') {
            this.dinoGameSrv.startGame();
        } else if (btnType === 'restart') {
            this.dinoGameSrv.restartGame();
        } else if (btnType === 'end') {
            this.dinoGameSrv.endGame();
        } else if (btnType === 'settings') {
            const { keyBindings, isMuted } = await this.sintolModalSrv.openConfirmModal<GameSettingsModalComponent, SettingsReturnedValue>(
                GameSettingsModalComponent,
                { initialKeyBindings: this.gameSettingsSrv.keyBindings, settings: this.gameSettingsSrv.settings }
            );
            this.gameSettingsSrv.changeKeyBindings(keyBindings);
            this.gameSettingsSrv.changeGameSettings({ isMuted });
        }
    }
}
