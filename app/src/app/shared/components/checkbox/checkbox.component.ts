import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InputBase } from '../../abstract/input-base';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent extends InputBase {
    @Input({ required: true }) label: string = '';

    @Input({ required: true }) control!: FormControl;

    public get isRequired(): boolean {
        return (this.control?.hasValidator(Validators.required) && this.showError) || false;
    }
}
