import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppContainerComponent } from './components/app-container/app-container.component';
import { MainOptionSelectorComponent } from './components/main-option-selector/main-option-selector.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { OptionInSelectorComponent } from './components/option-in-selector/option-in-selector.component';
import { SharedModule } from '../../shared/shared.module';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { OptionSelectorModalComponent } from './components/modal-option-selector/modal-option-selector.component';

@NgModule({
    declarations: [
        AppContainerComponent,
        MainOptionSelectorComponent,
        AppHeaderComponent,
        OptionInSelectorComponent,
        OptionSelectorModalComponent
    ],
    imports: [CommonModule, AppRoutingModule, SharedModule],
    exports: [AppContainerComponent]
})
export class AppContainerModule {}
