import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DinosaurGameComponent } from './components/dino-game/dinosaur-game.component';

const routes: Routes = [{ path: '', component: DinosaurGameComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DinoGameRoutingModule {}
