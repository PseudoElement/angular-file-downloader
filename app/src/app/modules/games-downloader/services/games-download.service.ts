import { ChangeDetectorRef, Injectable } from '@angular/core';
import { GameUiInfo, GameId, GAMES_IDS } from '../constants/games';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { BehaviorSubject } from 'rxjs';
import { wait } from 'src/app/utils/wait';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Injectable()
export class GamesDownloadService {
    private readonly downloadingStatuses = new BehaviorSubject<Record<GameId, boolean>>({
        [GAMES_IDS.ASTEROIDS]: false,
        [GAMES_IDS.KNIGTH_PLATFORMER]: false,
        [GAMES_IDS.SPACE_SHOOTER]: false,
        [GAMES_IDS.FLAPPY_BIRD]: false,
        [GAMES_IDS.RUST]: false,
        [GAMES_IDS.CS_2]: false,
        [GAMES_IDS.SPACE_MARINE_2]: false
    });

    constructor(private readonly httpApi: HttpApiService, private readonly sintolModalSrv: SintolLibDynamicComponentService) {}

    public async downloadGame(game: GameUiInfo, cdr: ChangeDetectorRef): Promise<void> {
        const ok = await this.sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
            isConfirmModal: true,
            text: `Are you sure you want download ${game.title}?`,
            title: 'Notification',
            width: 350,
            height: 250
        });
        if (!ok) return;
        cdr.markForCheck();

        try {
            this.toggleDownloadStatus(game.id, true);
            const fileName = game.title.toLowerCase().replace(/\s/g, '-');

            await wait(1_000);
            await this.httpApi.downloadFileGet(game.link, fileName);
        } catch (err) {
            console.log('GamesDownloadService_downloadGame] Error occured: ', err);
        } finally {
            this.toggleDownloadStatus(game.id, false);
            cdr.markForCheck();
        }
    }

    public isDownloadingGame(gameID: GameId): boolean {
        return this.downloadingStatuses.value[gameID];
    }

    private toggleDownloadStatus(gameID: GameId, isDownloading: boolean): void {
        const statuses = this.downloadingStatuses.value;
        this.downloadingStatuses.next({ ...statuses, [gameID]: isDownloading });
    }
}
