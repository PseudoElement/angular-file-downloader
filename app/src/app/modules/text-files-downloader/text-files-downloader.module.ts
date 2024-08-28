import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextFilesDownloaderRoutingModule } from './text-files-downloader-routing.module';
import { TextFilesDownloaderPageComponent } from './components/text-file-downloader-page/text-files-downloader.component';
import { OneTextColumnSettingsComponent } from './components/one-text-column-settings/one-text-column-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FileBuilderService } from './services/file-builder.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { DownloadService } from '../services/download.service';

@NgModule({
    declarations: [TextFilesDownloaderPageComponent, OneTextColumnSettingsComponent],
    imports: [CommonModule, TextFilesDownloaderRoutingModule, SharedModule, ReactiveFormsModule, FormsModule],
    providers: [FileBuilderService, DownloadService, HttpApiService]
})
export class TextFilesDownloaderModule {}
