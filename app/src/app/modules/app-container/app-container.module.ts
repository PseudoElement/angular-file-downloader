import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppContainerComponent } from './components/app-container/app-container.component';
import { MainOptionSelectorComponent } from './components/main-option-selector/main-option-selector.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { OptionInSelectorComponent } from './components/option-in-selector/option-in-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [AppContainerComponent, MainOptionSelectorComponent, AppHeaderComponent, OptionInSelectorComponent],
    imports: [CommonModule, AppRoutingModule, BrowserAnimationsModule],
    exports: [AppContainerComponent]
})
export class AppContainerModule {}
