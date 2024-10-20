import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DinosaurGameComponent } from './modules/dino-game/components/dino-game/dinosaur-game.component';
import { FlappyBirdGameComponent } from './modules/flappy-bird-game/components/flappy-bird-game/flappy-bird-game.component';
import { MiniGameMatchers } from './utils/matchers';
import { UnknownRouteComponent } from './components/unknown-route/unknown-route.component';

const routes: Routes = [
    { path: '', component: UnknownRouteComponent },
    { path: ':id', canMatch: [MiniGameMatchers.matchDinoGame], component: DinosaurGameComponent },
    { path: ':id', canMatch: [MiniGameMatchers.matchFlappyBirdGame], component: FlappyBirdGameComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GamesDownloaderRoutingModule {}
