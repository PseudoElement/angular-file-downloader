import { SelectOption } from 'src/app/shared/models/select-types';

export const DOCUMENT_TYPE_OPTIONS: SelectOption[] = [
    { value: 'sql', text: 'SQL', isDisabled: false },
    { value: 'pdf', text: 'PDF', isDisabled: false },
    { value: 'txt', text: 'TXT', isDisabled: false },
    { value: 'csv', text: 'CSV', isDisabled: false },
    { value: 'doc', text: 'DOC', isDisabled: false }
];
