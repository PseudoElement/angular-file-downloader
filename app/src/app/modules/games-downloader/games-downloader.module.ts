import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesDownloaderRoutingModule } from './games-downloader-routing.module';
import { GamesDownloaderComponent } from './components/games-downloader/games-downloader.component';
import { NavigationService } from './services/navigation.service';
import { SharedModule } from '../../shared/shared.module';
import { GamesDownloadService } from './services/games-download.service';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';

@NgModule({
    declarations: [GamesDownloaderComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule, SharedModule],
    providers: [NavigationService, GamesDownloadService, SintolLibDynamicComponentService]
})
export class GamesDownloaderModule {}
