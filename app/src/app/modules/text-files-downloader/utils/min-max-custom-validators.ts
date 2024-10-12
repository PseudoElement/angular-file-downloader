import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxLessMin(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.parent) return null;

        const minValue = control.parent.get('min')?.value || 0;

        if (parseInt(minValue) >= parseInt(control.value)) {
            return { maxLessMin: true };
        }

        return null;
    };
}

export function onlyInteger(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        const [_, decimals] = value.split('.');
        if (!!decimals) return { notInteger: true };

        return null;
    };
}
