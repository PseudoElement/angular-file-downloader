import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrl: './timer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {
    @Input({ required: true }) ms: number = 0;
}
