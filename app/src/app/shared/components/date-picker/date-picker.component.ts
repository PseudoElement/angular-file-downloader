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

    @Input() label: string = 'Enter a date range';

    public get error(): { [k: string]: { [key: string]: string | number } } | null {
        for (const key in this.formGroup.errors) {
            if (key) {
                return this.formGroup.errors;
            }
        }
        return null;
    }
}
