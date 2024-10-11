import { ValidatorFn } from '@angular/forms';
import { COLUMN_TYPES, ColumnType } from '../models/file-builder-types';
import {
    MAX_NUM_CTRL_VALIDATORS,
    MAX_STRING_LEN_CTRL_VALIDATORS,
    MIN_NUM_CTRL_VALIDATORS,
    MIN_STRING_LEN_CTRL_VALIDATORS
} from './control-validators';

export const MIN_MAX_VALIDATORS_PER_COLUMN_TYPE: Record<
    Extract<ColumnType, 'NUMBER' | 'STRING'>,
    { MIN: ValidatorFn[]; MAX: ValidatorFn[] }
> = {
    [COLUMN_TYPES.NUMBER]: {
        MIN: MIN_NUM_CTRL_VALIDATORS,
        MAX: MAX_NUM_CTRL_VALIDATORS
    },
    [COLUMN_TYPES.STRING]: {
        MIN: MIN_STRING_LEN_CTRL_VALIDATORS,
        MAX: MAX_STRING_LEN_CTRL_VALIDATORS
    }
};
