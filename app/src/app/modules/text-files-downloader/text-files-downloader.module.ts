import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextFilesDownloaderRoutingModule } from './text-files-downloader-routing.module';
import { TextFilesDownloaderPageComponent } from './components/text-file-downloader-page/text-files-downloader.component';
import { OneColumnSettingsComponent } from './components/one-column-settings/one-column-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [TextFilesDownloaderPageComponent, OneColumnSettingsComponent],
    imports: [CommonModule, TextFilesDownloaderRoutingModule, SharedModule]
})
export class TextFilesDownloaderModule {}
