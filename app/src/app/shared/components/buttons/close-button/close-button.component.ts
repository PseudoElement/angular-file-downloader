import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrl: './close-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloseButtonComponent {}
