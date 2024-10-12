import { Validators } from '@angular/forms';
import { START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS } from 'src/app/shared/constants/regex-patterns';
import { maxLessMin, onlyInteger } from '../utils/min-max-custom-validators';

export const COLUMN_NAME_CTRL_VALIDATORS = [
    Validators.required,
    Validators.maxLength(40),
    Validators.pattern(START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS)
];
export const MIN_STRING_LEN_CTRL_VALIDATORS = [Validators.required, Validators.max(30), Validators.min(1), onlyInteger()];
export const MAX_STRING_LEN_CTRL_VALIDATORS = [Validators.required, Validators.max(30), Validators.min(1), maxLessMin(), onlyInteger()];
export const MIN_NUM_CTRL_VALIDATORS = [Validators.required, Validators.max(10_000_000), Validators.min(-10_000_000), onlyInteger()];
export const MAX_NUM_CTRL_VALIDATORS = [
    Validators.required,
    Validators.max(10_000_000),
    Validators.min(-10_000_000),
    maxLessMin(),
    onlyInteger()
];
export const NULL_VALUE_PERCENT_VALIDATORS = [Validators.required, Validators.max(100), Validators.min(0)];
