import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextFilesDownloaderRoutingModule } from './text-files-downloader-routing.module';
import { TextFilesDownloaderPageComponent } from './components/text-file-downloader-page/text-files-downloader.component';
import { OneTextColumnSettingsComponent } from './components/one-text-column-settings/one-text-column-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FileBuilderService } from './services/file-builder.service';

@NgModule({
    declarations: [TextFilesDownloaderPageComponent, OneTextColumnSettingsComponent],
    imports: [CommonModule, TextFilesDownloaderRoutingModule, SharedModule],
    providers: [FileBuilderService]
})
export class TextFilesDownloaderModule {}
