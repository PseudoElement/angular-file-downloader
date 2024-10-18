import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinosaurGameComponent } from './components/dinosaur-game/dinosaur-game.component';
import { GamesDownloaderRoutingModule } from './mini-games-routing.module';
import { FlappyBirdGameComponent } from './components/flappy-bird-game/flappy-bird-game.component';
import { UnknownRouteComponent } from './components/unknown-route/unknown-route.component';
import { DinoGameBackgroundComponent } from './components/dinosaur-game/components/dino-game-background/dino-game-background.component';
import { DinoGameService } from './components/dinosaur-game/services/dino-game.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [DinosaurGameComponent, FlappyBirdGameComponent, UnknownRouteComponent, DinoGameBackgroundComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule, SharedModule],
    providers: [DinoGameService]
})
export class MiniGamesModule {}
