import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeaBattleGameComponent } from './components/sea-battle-game/sea-battle-game.component';
import { SeaBattleRoomComponent } from './components/sea-battle-room/sea-battle-room.component';
import { isRoomWithIdExistGuard } from './utils/can-activate-room-page.guard';

const routes: Routes = [
    // { path: 'room/:id', canActivate: [isRoomWithIdExistGuard], component: SeaBattleRoomComponent },
    { path: 'room/:id', component: SeaBattleRoomComponent },
    { path: '', component: SeaBattleGameComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeaBattleRoutingModule {}
