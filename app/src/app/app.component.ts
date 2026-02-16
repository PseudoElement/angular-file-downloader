import { AfterViewInit, Component } from '@angular/core';
import { ViewportService } from './shared/services/viewport.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
    constructor(private readonly viewportSrv: ViewportService) {
        document.body.classList.remove('mat-typography');
    }

    ngAfterViewInit(): void {
        this.viewportSrv.init();
    }
}
