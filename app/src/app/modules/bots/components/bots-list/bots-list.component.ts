import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-bots-list',
    templateUrl: './bots-list.component.html',
    styleUrl: './bots-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BotsListComponent {}
