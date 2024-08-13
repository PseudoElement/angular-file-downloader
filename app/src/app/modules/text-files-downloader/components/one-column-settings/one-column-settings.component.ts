import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-one-column-settings',
    templateUrl: './one-column-settings.component.html',
    styleUrl: './one-column-settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OneColumnSettingsComponent {}
