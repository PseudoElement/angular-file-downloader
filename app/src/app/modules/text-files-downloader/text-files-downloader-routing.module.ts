import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextFilesDownloaderComponent } from './components/text-files-downloader.component';

const routes: Routes = [{ path: '', component: TextFilesDownloaderComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TextFilesDownloaderRoutingModule {}
