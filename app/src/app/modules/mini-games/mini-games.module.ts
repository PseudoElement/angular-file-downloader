import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinosaurGameComponent } from './components/dinosaur-game/dinosaur-game.component';
import { GamesDownloaderRoutingModule } from './mini-games-routing.module';
import { FlappyBirdGameComponent } from './components/flappy-bird-game/flappy-bird-game.component';
import { UnknownRouteComponent } from './components/unknown-route/unknown-route.component';
import { DinoGameBackgroundComponent } from './components/dinosaur-game/components/dino-game-background/dino-game-background.component';

@NgModule({
    declarations: [DinosaurGameComponent, FlappyBirdGameComponent, UnknownRouteComponent, DinoGameBackgroundComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule]
})
export class MiniGamesModule {}
