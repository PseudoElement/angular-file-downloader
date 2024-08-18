import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-delete-button',
    templateUrl: './delete-button.component.html',
    styleUrl: './delete-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteButtonComponent {}
