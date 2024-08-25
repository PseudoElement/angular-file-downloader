import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private readonly router: Router) {
        document.body.classList.remove('mat-typography');
        this.router.navigate(['download-files']);
    }
}
