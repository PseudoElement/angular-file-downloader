import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotsRoutingModule } from './bots-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BotsListComponent } from './components/bots-list/bots-list.component';

@NgModule({
    declarations: [BotsListComponent],
    imports: [CommonModule, BotsRoutingModule, SharedModule]
})
export class BotsModule {}
