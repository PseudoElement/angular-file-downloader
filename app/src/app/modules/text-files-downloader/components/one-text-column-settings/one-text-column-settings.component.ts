import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-one-column-settings',
    templateUrl: './one-text-column-settings.component.html',
    styleUrl: './one-text-column-settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OneTextColumnSettingsComponent {}
