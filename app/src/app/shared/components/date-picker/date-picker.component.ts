import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent {
    @Input({ required: true }) formGroup!: FormGroup;

    @Input() fromDateControlName: string = 'fromDate';

    @Input() toDateControlName: string = 'toDate';

    @Input() label: string = 'Enter a date range';

    public get error(): { [k: string]: { [key: string]: string | number } } | null {
        const fromCtrl = this.formGroup.controls[this.fromDateControlName];
        const toCtrl = this.formGroup.controls[this.toDateControlName];

        return fromCtrl.errors || toCtrl.errors || null;
    }
}
