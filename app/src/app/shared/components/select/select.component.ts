import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectOption } from '../../models/select-types';
import { FormControl } from '@angular/forms';
import { InputBase } from '../../abstract/input-base';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends InputBase {
    @Input({ required: true }) label: string = '';

    @Input({ required: true }) control!: FormControl;

    @Input({ required: true }) options: SelectOption[] = [];
}
