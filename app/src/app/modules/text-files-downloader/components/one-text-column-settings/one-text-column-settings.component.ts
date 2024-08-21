import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SqlColumnControl, TextColumnControl } from '../../models/file-builder-types';
import { COLUMN_TYPE_OPTIONS } from '../../constants/column-type-options';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-one-column-settings',
    templateUrl: './one-text-column-settings.component.html',
    styleUrl: './one-text-column-settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('opacityAnimation', [
            transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
            transition(':leave', [style({ opacity: 1 }), animate('200ms', style({ opacity: 0 }))])
        ])
    ]
})
export class OneTextColumnSettingsComponent {
    @Input({ required: true }) columnFormGroup!: FormGroup<TextColumnControl | SqlColumnControl>;

    @Input({ required: true }) isSqlDocType: boolean = false;

    @Output() handleRemove = new EventEmitter<void>();

    public readonly columnTypeOptions = COLUMN_TYPE_OPTIONS;

    public getControlFromColumnGroup(controlName: keyof SqlColumnControl): FormControl {
        return this.columnFormGroup.get(controlName) as FormControl;
    }

    public removeColumns(): void {
        this.handleRemove.emit();
    }
}
