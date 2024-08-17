import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_COLUMN_DATA } from '../constants/default-column-data';
import {
    ColumnType,
    DocumentType,
    FileBuilderForm,
    FileBuilderFormValue,
    SqlColumnControl,
    TextColumnControl,
    TextColumnInfo
} from '../models/file-builder-types';
import { distinctUntilChanged, map } from 'rxjs';

@Injectable()
export class FileBuilderService {
    public readonly fileBuilderForm = new FormGroup<FileBuilderForm>({
        columns: new FormArray<FormGroup<TextColumnControl | SqlColumnControl>>([], [Validators.required]),
        docType: new FormControl<DocumentType>('sql', [Validators.required]) as FormControl,
        docName: new FormControl<string>('default', [Validators.required]) as FormControl,
        needCreateSqlTable: new FormControl<boolean>(false, [Validators.required]) as FormControl
    });

    public get docTypeControl(): FormControl<DocumentType> {
        return this.fileBuilderForm.controls['docType'];
    }

    public get docNameControl(): FormControl<string> {
        return this.fileBuilderForm.controls['docName'];
    }

    public get needCreateSqlTableControl(): FormControl<boolean> | undefined {
        return this.fileBuilderForm.controls['needCreateSqlTable'];
    }

    public get columnsFormArray(): FormArray<FormGroup<TextColumnControl | SqlColumnControl>> {
        return this.fileBuilderForm.controls.columns;
    }

    public get columnsFormArrayControls(): FormGroup<TextColumnControl | SqlColumnControl>[] {
        return this.fileBuilderForm.controls.columns.controls;
    }

    public readonly isSqlDocType$ = this.fileBuilderForm.valueChanges.pipe(map((val) => val.docType === 'sql'));

    constructor() {
        this.handleValueChanges();
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

    public deleteColumn(index: number): void {
        this.columnsFormArray.removeAt(index);
    }

    /**
     * @param paramName keys of TextColumnInfo | SqlColumnInfo
     * @param columnIndex index od column in FormArray to change value from default to data from inputs
     */
    public updateColumn<T extends string | number | ColumnType>(paramName: keyof TextColumnInfo, newValue: T, index: number): void {
        const columnInfo = this.columnsFormArray.at(index);
        const control = columnInfo.controls[paramName] as FormControl<T>;
        control.patchValue(newValue);
    }

    private handleValueChanges(): void {
        this.fileBuilderForm.valueChanges.pipe(distinctUntilChanged()).subscribe((val) => {
            this.handleDocTypeChange(val as FileBuilderFormValue);
        });
    }

    private handleDocTypeChange(val: FileBuilderFormValue): void {
        if (val.docType === 'sql') {
            const ctrl = new FormControl(false, [Validators.required]) as FormControl;
            this.fileBuilderForm.addControl('needCreateSqlTable', ctrl, {
                emitEvent: true
            });
            this.columnsFormArray.controls.forEach((column) => this.addSqlSpecificControlsInColumn(column));
        } else {
            if (this.fileBuilderForm.contains('needCreateSqlTable')) {
                this.fileBuilderForm.removeControl('needCreateSqlTable', { emitEvent: true });
            }
            this.columnsFormArray.controls.forEach((column) => this.deleteSqlSpecificControlsInColumn(column));
        }
    }

    private addSqlSpecificControlsInColumn(column: FormGroup<any>): void {
        if (!column.contains('isPrimaryKey')) {
            const primaryKeyCtrl = new FormControl(DEFAULT_COLUMN_DATA.isPrimaryKey) as FormControl;
            column.addControl('isPrimaryKey', primaryKeyCtrl, { emitEvent: true });
        }
        if (!column.contains('refColumnName')) {
            const refColumnNameCtrl = new FormControl(DEFAULT_COLUMN_DATA.foreignKeyData.refColumnName) as FormControl;
            column.addControl('refColumnName', refColumnNameCtrl, { emitEvent: true });
        }
        if (!column.contains('refTableName')) {
            const refTableNameCtrl = new FormControl(DEFAULT_COLUMN_DATA.foreignKeyData.refTableName) as FormControl;
            column.addControl('refTableName', refTableNameCtrl, { emitEvent: true });
        }
    }

    private deleteSqlSpecificControlsInColumn(column: FormGroup<any>): void {
        if (column.contains('isPrimaryKey')) column.removeControl('isPrimaryKey');
        if (column.contains('refColumnName')) column.removeControl('refColumnName');
        if (column.contains('refTableName')) column.removeControl('refTableName');
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
