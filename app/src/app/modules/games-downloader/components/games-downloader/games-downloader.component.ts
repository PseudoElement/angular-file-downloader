import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { GAMES } from '../../constants/games';

@Component({
    selector: 'app-games-downloader',
    templateUrl: './games-downloader.component.html',
    styleUrl: './games-downloader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesDownloaderComponent {
    public readonly games$ = this.navigationSrv.games$;

    constructor(private readonly navigationSrv: NavigationService) {}
}
