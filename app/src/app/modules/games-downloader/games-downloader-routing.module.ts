import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesDownloaderComponent } from './components/games-downloader/games-downloader.component';

const routes: Routes = [
    { path: '', component: GamesDownloaderComponent },
    { path: ':id', component: GamesDownloaderComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GamesDownloaderRoutingModule {}
