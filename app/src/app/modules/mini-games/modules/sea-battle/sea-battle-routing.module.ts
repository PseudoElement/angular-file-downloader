import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeaBattleGameComponent } from './components/sea-battle-game/sea-battle-game.component';

const routes: Routes = [{ path: '', component: SeaBattleGameComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeaBattleRoutingModule {}
