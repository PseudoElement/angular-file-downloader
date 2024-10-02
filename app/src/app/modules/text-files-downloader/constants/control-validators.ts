import { Validators } from '@angular/forms';
import { START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS } from 'src/app/shared/constants/regex-patterns';

export const COLUMN_NAME_CTRL_VALIDATORS = [
    Validators.required,
    Validators.maxLength(40),
    Validators.pattern(START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS)
];
export const MIN_CTRL_VALIDATORS = [Validators.required, Validators.max(10), Validators.min(1)];
export const MAX_CTRL_VALIDATORS = [Validators.required, Validators.max(30), Validators.min(11)];
export const NULL_VALUE_PERCENT_VALIDATORS = [Validators.required, Validators.max(100), Validators.min(0)];
