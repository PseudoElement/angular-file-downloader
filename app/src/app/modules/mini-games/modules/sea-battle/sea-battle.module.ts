import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeaBattleGameComponent } from './components/sea-battle-game/sea-battle-game.component';
import { SeaBattleRoutingModule } from './sea-battle-routing.module';
import { SeaBattleApiService } from './services/sea-battle-api.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [SeaBattleGameComponent],
    imports: [CommonModule, SeaBattleRoutingModule, SharedModule],
    providers: [SeaBattleApiService]
})
export class SeaBattleModule {}