import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { matcherGuard } from './guards/matcher.guard';

const routes: Routes = [
    {
        path: 'download-games',
        loadChildren: () => import('./modules/games-downloader/games-downloader.module').then((m) => m.GamesDownloaderModule)
    },
    {
        path: 'download-files',
        loadChildren: () => import('./modules/text-files-downloader/text-files-downloader.module').then((m) => m.TextFilesDownloaderModule)
    },
    {
        path: 'tutorial',
        loadChildren: () => import('./modules/tutorial/tutorial.module').then((m) => m.TutorialModule)
    },
    {
        canMatch: [matcherGuard],
        path: 'license',
        loadChildren: () => import('./modules/license/license.module').then((m) => m.LicenseModule)
    },
    {
        path: 'telegram-bots',
        loadChildren: () => import('./modules/bots/bots.module').then((m) => m.BotsModule)
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
