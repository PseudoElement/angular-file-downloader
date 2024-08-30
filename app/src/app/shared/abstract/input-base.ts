import { FormControl } from '@angular/forms';

export abstract class InputBase {
    public abstract control: FormControl;

    public abstract label: string;

    public get value(): unknown {
        return this.control.value;
    }

    public get showError(): boolean {
        return (this.control.touched && this.control.dirty) || (this.control.root.touched && this.control.root.dirty);
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
