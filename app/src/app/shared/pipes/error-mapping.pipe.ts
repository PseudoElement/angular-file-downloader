import { Pipe, PipeTransform } from '@angular/core';
import { REGEX_PATTERN_ERRORS, RegexPattern } from '../constants/regex-patterns';

@Pipe({
    name: 'errorMapping'
})
export class ErrorMappingPipe implements PipeTransform {
    transform(errors: { [k: string]: { [key: string]: number | string } }, pattern?: RegexPattern): string {
        if ('min' in errors && 'min' in errors['min'] && 'actual' in errors['min']) {
            return `Min value is ${errors['min']['min']}. Current is ${errors['min']['actual']}.`;
        } else if ('max' in errors && 'max' in errors['max'] && 'actual' in errors['max']) {
            return `Max value is ${errors['max']['max']}. Current is ${errors['max']['actual']}.`;
        } else if ('email' in errors) {
            return 'Invalid email.';
        } else if ('maxlength' in errors && 'actualLength' in errors['maxlength'] && 'requiredLength' in errors['maxlength']) {
            return `Max length is ${errors['maxlength']['requiredLength']}. Current is ${errors['maxlength']['actualLength']}.`;
        } else if ('minlength' in errors && 'actualLength' in errors['minlength'] && 'requiredLength' in errors['minlength']) {
            return `Min length is ${errors['minlength']['requiredLength']}. Current is ${errors['minlength']['actualLength']}.`;
        } else if ('required' in errors) {
            return 'Field is required.';
        } else if ('maxLessMin' in errors) {
            return "Max value can't be less than min.";
        } else if ('notInteger' in errors) {
            return 'Only integers available.';
        } else if ('pattern' in errors && !!pattern) {
            return REGEX_PATTERN_ERRORS[pattern];
        } else {
            return 'Invalid input data.';
        }
    }
}
