import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppContainerModule } from './modules/app-container/app-container.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, AppContainerModule, HttpClientModule],
    providers: [SintolLibDynamicComponentService],
    bootstrap: [AppComponent]
})
export class AppModule {}
