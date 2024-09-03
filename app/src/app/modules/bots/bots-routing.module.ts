import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BotsListComponent } from './components/bots-list/bots-list.component';

const routes: Routes = [{ path: '', component: BotsListComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BotsRoutingModule {}
