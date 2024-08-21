import { SelectOption } from 'src/app/shared/models/select-types';
import { DocumentType } from '../models/file-builder-types';

export interface DocTypeSelectOption extends SelectOption {
    value: DocumentType;
}

export const DOCUMENT_TYPE_OPTIONS: DocTypeSelectOption[] = [
    { value: 'sql', text: 'SQL', isDisabled: false },
    { value: 'pdf', text: 'PDF', isDisabled: false },
    { value: 'txt', text: 'TXT', isDisabled: false },
    { value: 'csv', text: 'CSV', isDisabled: false },
    { value: 'doc', text: 'DOC', isDisabled: false }
];
