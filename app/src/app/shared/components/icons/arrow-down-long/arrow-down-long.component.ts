import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-arrow-down-long',
    templateUrl: './arrow-down-long.component.html',
    styleUrl: './arrow-down-long.component.scss'
})
export class ArrowDownLongComponent {
    @Input() isActive: boolean = false;
}
