import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../../constants/games';
import { GamesDownloadService } from '../../services/games-download.service';

@Component({
    selector: 'app-games-downloader',
    templateUrl: './games-downloader.component.html',
    styleUrl: './games-downloader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesDownloaderComponent {
    public readonly games$: Observable<Game[]> = this.navigationSrv.getFilteredGames$(this.route);

    constructor(
        private readonly navigationSrv: NavigationService,
        private readonly route: ActivatedRoute,
        private readonly gamesDownloadSrv: GamesDownloadService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    public callbackOnInfoClick(game: Game): () => Promise<void> {
        return async () => await this.gamesDownloadSrv.downloadGame(game, this.cdr);
    }

    public isDownloadingGame(game: Game): boolean {
        return this.gamesDownloadSrv.isDownloadingGame(game.id);
    }
}
