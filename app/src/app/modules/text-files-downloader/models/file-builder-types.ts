import { FormArray, FormControl, FormGroup } from '@angular/forms';

export const COLUMN_TYPES = {
    BOOL: 'BOOL',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    AUTO_INCREMENT: 'AUTO_INCREMENT',
    FIRST_NAME: 'FIRST_NAME',
    LAST_NAME: 'LAST_NAME',
    COUNTRY: 'COUNTRY',
    CAR: 'CAR'
} as const;

export type ColumnType = (typeof COLUMN_TYPES)[keyof typeof COLUMN_TYPES];
export type DocumentType = 'pdf' | 'txt' | 'sql' | 'csv' | 'doc';

export interface TextColumnInfo {
    name: string;
    type: ColumnType;
    nullValuesPercent: number;
    min: number;
    max: number;
}

export interface SqlColumnInfo extends TextColumnInfo {
    isPrimaryKey: boolean;
    foreignKeyData: ForeignKeyData;
}

export interface ForeignKeyData {
    refTableName: string;
    refColumnName: string;
}

export interface TextColumnControl {
    name: FormControl<string>;
    type: FormControl<ColumnType>;
    nullValuesPercent: FormControl<number>;
    min: FormControl<number>;
    max: FormControl<number>;
}

export interface SqlColumnControl extends TextColumnControl {
    isPrimaryKey: FormControl<boolean>;
    refTableName: FormControl<string>;
    refColumnName: FormControl<string>;
}

export interface FileBuilderForm {
    columns: FormArray<FormGroup<TextColumnControl | SqlColumnControl>>;
    docType: FormControl<DocumentType>;
    docName: FormControl<string>;
    needCreateSqlTable?: FormControl<boolean>;
}

export interface FileBuilderFormValue {
    columns: Array<
        Partial<
            | {
                  name: string;
                  type: ColumnType;
                  nullValuesPercent: number;
                  min: number;
                  max: number;
              }
            | {
                  isPrimaryKey: boolean;
                  refTableName: string;
                  refColumnName: string;
                  name: string;
                  type: ColumnType;
                  nullValuesPercent: number;
                  min: number;
                  max: number;
              }
        >
    >;
    docType: DocumentType;
    docName: string;
    needCreateSqlTable?: boolean | undefined;
}