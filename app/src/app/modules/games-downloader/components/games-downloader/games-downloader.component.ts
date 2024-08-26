import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-games-downloader',
    templateUrl: './games-downloader.component.html',
    styleUrl: './games-downloader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesDownloaderComponent {}
