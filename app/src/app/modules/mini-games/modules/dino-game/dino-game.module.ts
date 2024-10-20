import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinosaurGameComponent } from './components/dino-game/dinosaur-game.component';
import { DinoGameBackgroundComponent } from './components/dino-game-background/dino-game-background.component';
import { DinoGameService } from './services/dino-game.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [DinosaurGameComponent, DinoGameBackgroundComponent],
    imports: [CommonModule, SharedModule],
    providers: [DinoGameService]
})
export class DinoGameModule {}
