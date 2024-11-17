import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GameUiInfo } from '../../constants/games';
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
    public readonly games$: Observable<GameUiInfo[]> = this.navigationSrv.getFilteredGames$(this.route);

    constructor(
        private readonly navigationSrv: NavigationService,
        private readonly route: ActivatedRoute,
        private readonly gamesDownloadSrv: GamesDownloadService,
        private readonly cdr: ChangeDetectorRef,
        private readonly sintolModalSrv: SintolLibDynamicComponentService
    ) {}

    public async onGameCardClick(game: GameUiInfo): Promise<void> {
        await this.sintolModalSrv.openConfirmModal<ModalComponent, boolean>(ModalComponent, {
            isConfirmModal: false,
            title: game.title,
            text: game.description,
            height: 300,
            width: 450
        });
    }

    public async onButtonClick(game: GameUiInfo): Promise<void> {
        if (game.isDownloader) {
            await this.gamesDownloadSrv.downloadGame(game, this.cdr);
            return;
        }
        window.open(game.link, '_blank');
    }

    public isDownloadingGame(game: GameUiInfo): boolean {
        return this.gamesDownloadSrv.isDownloadingGame(game.id);
    }
}
