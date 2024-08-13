import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextFilesDownloaderPageComponent } from './components/text-file-downloader-page/text-files-downloader.component';

const routes: Routes = [{ path: '', component: TextFilesDownloaderPageComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TextFilesDownloaderRoutingModule {}
