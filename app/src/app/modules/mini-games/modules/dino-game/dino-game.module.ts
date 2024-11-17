import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinosaurGameComponent } from './components/dino-game/dinosaur-game.component';
import { DinoGameBackgroundComponent } from './components/dino-game-background/dino-game-background.component';
import { DinoGameService } from './services/dino-game.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { DinoGameObservers } from './services/dino-game-observers.service';
import { DinoGameContainerService } from './services/dino-game-container.service';
import { DinoGameStateService } from './services/dino-game-state.service';
import { DinoGameRoutingModule } from './dino-game-routing.module';
import { DinoGameControlsService } from './services/dino-game-controls.service';

@NgModule({
    declarations: [DinosaurGameComponent, DinoGameBackgroundComponent],
    imports: [CommonModule, DinoGameRoutingModule, SharedModule],
    providers: [DinoGameService, DinoGameObservers, DinoGameContainerService, DinoGameStateService, DinoGameControlsService]
})
export class DinoGameModule {}
