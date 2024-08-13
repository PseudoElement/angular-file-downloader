import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputType } from '../../models/inputs';
import { AppErrorStateMatcher } from '../../utils/error-matcher';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss'
})
export class InputComponent {
    @Input({ required: true }) label: string = '';

    @Input({ required: true }) control!: FormControl;

    @Input() type: InputType = 'text';

    @Input() placeholder: string = '';

    public readonly errorMatcher = new AppErrorStateMatcher();

    public get error(): { [k: string]: { [key: string]: string | number } } | null {
        console.log(this.control.errors);
        for (const key in this.control.errors) {
            if (key) {
                return this.control.errors;
            }
        }
        return null;
    }
}
