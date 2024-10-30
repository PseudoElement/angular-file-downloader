import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesDownloaderRoutingModule } from './mini-games-routing.module';
import { UnknownRouteComponent } from './components/unknown-route/unknown-route.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DinoGameModule } from './modules/dino-game/dino-game.module';
import { FlappyBirdGameModule } from './modules/flappy-bird-game/flappy-bird-game.module';

@NgModule({
    declarations: [UnknownRouteComponent],
    imports: [CommonModule, GamesDownloaderRoutingModule, SharedModule, FlappyBirdGameModule, DinoGameModule]
})
export class MiniGamesModule {}
