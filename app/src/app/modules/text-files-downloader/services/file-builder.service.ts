import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_COLUMN_DATA } from '../constants/default-column-data';
import {
    ColumnsControl,
    ColumnType,
    DocumentType,
    SqlColumnControl,
    SqlColumnInfo,
    TextColumnControl,
    TextColumnInfo
} from '../models/file-builder-types';

@Injectable()
export class FileBuilderService {
    public readonly fileBuilderForm = new FormGroup({
        columns: new FormArray<FormGroup>([], [Validators.required]),
        docType: new FormControl<DocumentType>('txt', [Validators.required]),
        docName: new FormControl<string>('default', [Validators.required])
    });

    public get columnsFormArray(): FormArray<FormGroup<TextColumnControl | SqlColumnControl>> {
        return this.fileBuilderForm.controls.columns;
    }

    public addNewColumn(): void {
        const uniqueName = `${DEFAULT_COLUMN_DATA.name}_${Date.now()}`;
        const newColumn = new FormGroup<TextColumnControl | SqlColumnControl>({
            name: new FormControl(uniqueName, [Validators.required]) as FormControl,
            type: new FormControl(DEFAULT_COLUMN_DATA.type, [Validators.required]) as FormControl,
            max: new FormControl(DEFAULT_COLUMN_DATA.max, [Validators.required]) as FormControl,
            min: new FormControl(DEFAULT_COLUMN_DATA.min, [Validators.required]) as FormControl,
            nullValuesPercent: new FormControl(DEFAULT_COLUMN_DATA.nullValuesPercent) as FormControl,
            isPrimaryKey: new FormControl(DEFAULT_COLUMN_DATA.isPrimaryKey) as FormControl,
            refColumnName: new FormControl(DEFAULT_COLUMN_DATA.foreignKeyData.refColumnName) as FormControl,
            refTableName: new FormControl(DEFAULT_COLUMN_DATA.foreignKeyData.refTableName) as FormControl
        });

        this.columnsFormArray.push(newColumn);
    }

    /**
     * @param paramName keys of TextColumnInfo | SqlColumnInfo
     * @param columnIndex index od column in FormArray to change value from default to data from inputs
     */
    public updateColumnInfo<T extends string | number | ColumnType>(
        paramName: keyof TextColumnInfo,
        newValue: T,
        columnIndex: number
    ): void {
        const columnInfo = this.columnsFormArray.at(columnIndex);
        const control = columnInfo.controls[paramName] as FormControl<T>;
        control.patchValue(newValue);
    }
}

/**
 *      columns: new FormArray<>([new FormControl(name), new FormControl(type), new FormControl(min) ...])
 *      docType: new FormControl<DocumentType>('txt', [Validators.required]),
        docName: new FormControl<string>('default', [Validators.required])
 *  {
 *      columns: [{column}], docType: 'sql' | 'txt', docName: string
 *  }
 *
 */
