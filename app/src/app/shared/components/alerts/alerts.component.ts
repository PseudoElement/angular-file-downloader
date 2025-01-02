import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertInfo, AlertsService } from '../../services/alerts.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('opacityAnimation', [
            transition(':enter', [style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))]),
            transition(':leave', [style({ opacity: 1 }), animate('100ms', style({ opacity: 0 }))])
        ])
    ]
})
export class AlertsComponent {
    public readonly alerts$ = this.alertsSrv.alerts$;

    constructor(private readonly alertsSrv: AlertsService) {}

    public closeAlert(alert: AlertInfo): void {
        this.alertsSrv.closeAlert(alert.id);
    }
}
