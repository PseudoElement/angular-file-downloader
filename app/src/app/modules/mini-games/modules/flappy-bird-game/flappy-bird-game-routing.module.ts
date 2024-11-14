import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlappyBirdGameComponent } from './components/flappy-bird-game/flappy-bird-game.component';

const routes: Routes = [{ path: '', component: FlappyBirdGameComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FlappyBirdGameRoutingModule {}
