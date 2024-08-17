import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextFilesDownloaderRoutingModule } from './text-files-downloader-routing.module';
import { TextFilesDownloaderPageComponent } from './components/text-file-downloader-page/text-files-downloader.component';
import { OneTextColumnSettingsComponent } from './components/one-text-column-settings/one-text-column-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FileBuilderService } from './services/file-builder.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'src/app/app-routing.module';

@NgModule({
    declarations: [TextFilesDownloaderPageComponent, OneTextColumnSettingsComponent],
    imports: [CommonModule, TextFilesDownloaderRoutingModule, SharedModule, AppRoutingModule, BrowserAnimationsModule],
    providers: [FileBuilderService]
})
export class TextFilesDownloaderModule {}
