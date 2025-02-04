import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BaseAlert {
    text: string;
    type: 'success' | 'warn' | 'error' | 'info';
    closeDelay?: number;
}

export interface AlertInfo extends BaseAlert {
    id: string;
}

const DEFAULT_CLOSE_DELAY = 60_000;

@Injectable({
    providedIn: 'root'
})
export class AlertsService {
    private readonly _alerts$ = new BehaviorSubject<AlertInfo[]>([]);

    public readonly alerts$ = this._alerts$.asObservable();

    public showAlert(alert: BaseAlert): void {
        const fullAlert = { ...alert, id: crypto.randomUUID() };
        this._alerts$.next([...this._alerts$.value, fullAlert]);
        setTimeout(() => {
            this.closeAlert(fullAlert.id);
        }, alert.closeDelay || DEFAULT_CLOSE_DELAY);
    }

    public closeAlert(id: string): void {
        const filtered = this._alerts$.value.filter((alert) => alert.id !== id);
        this._alerts$.next(filtered);
    }
}
