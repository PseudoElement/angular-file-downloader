import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../../constants/games';
import { GamesDownloadService } from '../../services/games-download.service';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Component({
    selector: 'app-games-downloader',
    templateUrl: './games-downloader.component.html',
    styleUrl: './games-downloader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesDownloaderComponent {
    private readonly MAX_DESCRIPTION_LEN = 100;

    public readonly games$: Observable<Game[]> = this.navigationSrv.getFilteredGames$(this.route);

    constructor(
        private readonly navigationSrv: NavigationService,
        private readonly route: ActivatedRoute,
        private readonly gamesDownloadSrv: GamesDownloadService,
        private readonly cdr: ChangeDetectorRef,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    public async onGameCardClick(game: Game): Promise<void> {
        await this.sintolModalSrv.openConfirmModal(ModalComponent, {
            isConfirmModal: false,
            title: game.title,
            text: game.description
        });
    }

    public callbackOnButtonClick(game: Game): () => Promise<void> {
        if (game.isDownloader) {
            return async () => {
                await this.gamesDownloadSrv.downloadGame(game, this.cdr);
            };
        }
        return async () => {
            window.open(game.link, '_blank');
        };
    }

    public isDownloadingGame(game: Game): boolean {
        return this.gamesDownloadSrv.isDownloadingGame(game.id);
    }
}
