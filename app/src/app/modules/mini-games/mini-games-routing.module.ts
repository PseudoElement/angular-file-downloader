import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiniGameMatchers } from './utils/matchers';
import { UnknownRouteComponent } from './components/unknown-route/unknown-route.component';

const routes: Routes = [
    { path: '', component: UnknownRouteComponent },
    {
        path: ':id',
        canMatch: [MiniGameMatchers.matchDinoGame],
        loadChildren: () => import('./modules/dino-game/dino-game.module').then((m) => m.DinoGameModule)
    },
    {
        path: ':id',
        canMatch: [MiniGameMatchers.matchFlappyBirdGame],
        loadChildren: () => import('./modules/flappy-bird-game/flappy-bird-game.module').then((m) => m.FlappyBirdGameModule)
    },
    {
        path: ':id',
        canMatch: [MiniGameMatchers.matchSeabattleGame],
        loadChildren: () => import('./modules/sea-battle/sea-battle.module').then((m) => m.SeaBattleModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GamesDownloaderRoutingModule {}
