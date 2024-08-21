import { SelectOption } from 'src/app/shared/models/select-types';
import { COLUMN_TYPES } from '../models/file-builder-types';

export const COLUMN_TYPE_OPTIONS: SelectOption[] = [
    { value: COLUMN_TYPES.STRING, text: 'Random string', isDisabled: false },
    { value: COLUMN_TYPES.AUTO_INCREMENT, text: 'Unique number from 0 to infinity', isDisabled: false },
    { value: COLUMN_TYPES.BOOL, text: 'Boolean', isDisabled: false },
    { value: COLUMN_TYPES.CAR, text: 'Car name', isDisabled: false },
    { value: COLUMN_TYPES.COUNTRY, text: 'Country', isDisabled: false },
    { value: COLUMN_TYPES.FIRST_NAME, text: 'First name', isDisabled: false },
    { value: COLUMN_TYPES.LAST_NAME, text: 'Last name', isDisabled: false },
    { value: COLUMN_TYPES.NUMBER, text: 'Random number', isDisabled: false }
];
