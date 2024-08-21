import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputType } from '../../models/inputs';
import { InputBase } from '../../abstract/input-base';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent extends InputBase {
    @Input({ required: true }) label: string = '';

    @Input({ required: true }) control!: FormControl;

    @Input() type: InputType = 'text';

    @Input() placeholder: string = '';
}
