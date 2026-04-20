import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ViewportService } from './shared/services/viewport.service';
import { AudioLoaderService } from './core/audio/audio-loader.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
    constructor(
        private readonly viewportSrv: ViewportService,
        private readonly audioLoaderSrv: AudioLoaderService
    ) {
        document.body.classList.remove('mat-typography');
    }

    ngOnInit(): void {
        this.audioLoaderSrv.init();
    }

    ngAfterViewInit(): void {
        this.viewportSrv.init();
    }
}
