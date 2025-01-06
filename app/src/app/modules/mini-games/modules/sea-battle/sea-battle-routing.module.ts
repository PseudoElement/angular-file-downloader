import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeaBattleGameComponent } from './components/sea-battle-game/sea-battle-game.component';
import { SeaBattleRoomComponent } from './components/sea-battle-room/sea-battle-room.component';
import { SeaBattleFieldComponent } from './components/sea-battle-field/sea-battle-field.component';

const routes: Routes = [
    { path: 'room/:id', component: SeaBattleRoomComponent },
    { path: '', component: SeaBattleGameComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeaBattleRoutingModule {}
