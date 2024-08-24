import { FormControl } from '@angular/forms';
import { AppErrorStateMatcher } from '../utils/error-matcher';

export abstract class InputBase {
    public abstract control: FormControl;

    public abstract label: string;

    public readonly errorMatcher = new AppErrorStateMatcher();

    public get value(): unknown {
        return this.control.value;
    }

    public get showError(): boolean {
        return !!this.error && this.control.touched && this.control.dirty;
    }

    public get error(): { [k: string]: { [key: string]: string | number } } | null {
        for (const key in this.control.errors) {
            if (key) {
                return this.control.errors;
            }
        }
        return null;
    }
}
