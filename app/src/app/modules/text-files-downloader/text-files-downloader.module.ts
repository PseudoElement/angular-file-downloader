import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextFilesDownloaderRoutingModule } from './text-files-downloader-routing.module';
import { TextFilesDownloaderComponent } from './components/text-files-downloader.component';

@NgModule({
    declarations: [TextFilesDownloaderComponent],
    imports: [CommonModule, TextFilesDownloaderRoutingModule]
})
export class TextFilesDownloaderModule {}
