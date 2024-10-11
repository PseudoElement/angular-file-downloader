import { Validators } from '@angular/forms';
import { START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS } from 'src/app/shared/constants/regex-patterns';

export const COLUMN_NAME_CTRL_VALIDATORS = [
    Validators.required,
    Validators.maxLength(40),
    Validators.pattern(START_WITH_LETTER_AND_ALLOWED_HAVE_DIGITS)
];
export const MIN_STRING_LEN_CTRL_VALIDATORS = [Validators.required, Validators.max(10), Validators.min(1)];
export const MAX_STRING_LEN_CTRL_VALIDATORS = [Validators.required, Validators.max(30), Validators.min(11)];
export const MIN_NUM_CTRL_VALIDATORS = [Validators.required, Validators.max(1_000_000), Validators.min(-1_000_000)];
export const MAX_NUM_CTRL_VALIDATORS = [Validators.required, Validators.max(1_000_000), Validators.min(-1_000_000)];
export const NULL_VALUE_PERCENT_VALIDATORS = [Validators.required, Validators.max(100), Validators.min(0)];
