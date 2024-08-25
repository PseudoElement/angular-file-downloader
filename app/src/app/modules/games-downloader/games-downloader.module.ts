import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesDownloaderRoutingModule } from './games-downloader-routing.module';
import { GamesDownloaderComponent } from './components/games-downloader/games-downloader.component';

@NgModule({
    declarations: [GamesDownloaderComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule]
})
export class GamesDownloaderModule {}
