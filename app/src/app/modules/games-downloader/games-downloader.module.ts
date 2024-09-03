import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesDownloaderRoutingModule } from './games-downloader-routing.module';
import { GamesDownloaderComponent } from './components/games-downloader/games-downloader.component';
import { NavigationService } from './services/navigation.service';

@NgModule({
    declarations: [GamesDownloaderComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule],
    providers: [NavigationService]
})
export class GamesDownloaderModule {}
