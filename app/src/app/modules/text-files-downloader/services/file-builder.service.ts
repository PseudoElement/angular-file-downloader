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
import { distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { DOCUMENT_TYPE_OPTIONS } from '../constants/document-type-options';

@Injectable()
export class FileBuilderService {
    public readonly fileBuilderForm = new FormGroup<FileBuilderForm>({
        columns: new FormArray<FormGroup<TextColumnControl | SqlColumnControl>>([], [Validators.required]),
        docType: new FormControl<DocumentType>(DOCUMENT_TYPE_OPTIONS[0].value, [Validators.required]) as FormControl,
        docName: new FormControl<string>('default', [Validators.required]) as FormControl,
        rowsCount: new FormControl<number>(100, [Validators.required, Validators.max(40_000), Validators.min(1)]) as FormControl,
        needCreateSqlTable: new FormControl<boolean>(false) as FormControl,
        tableName: new FormControl<string>('default_table', [Validators.required]) as FormControl
    });

    public get docTypeControl(): FormControl<DocumentType> {
        return this.fileBuilderForm.controls['docType'];
    }

    public get docNameControl(): FormControl<string> {
        return this.fileBuilderForm.controls['docName'];
    }

    public get rowsCountControl(): FormControl<number> {
        return this.fileBuilderForm.controls['rowsCount'];
    }

    public get needCreateSqlTableControl(): FormControl<boolean> | undefined {
        return this.fileBuilderForm.controls['needCreateSqlTable'];
    }

    public get tableNameControl(): FormControl<string> | undefined {
        return this.fileBuilderForm.controls['tableName'];
    }

    public get columnsFormArray(): FormArray<FormGroup<TextColumnControl | SqlColumnControl>> {
        return this.fileBuilderForm.controls.columns;
    }

    public get columnsFormArrayControls(): FormGroup<TextColumnControl | SqlColumnControl>[] {
        return this.fileBuilderForm.controls.columns.controls;
    }

    public get isSqlDocType(): boolean {
        return this.fileBuilderForm.value.docType === 'sql';
    }

    public readonly isSqlDocType$ = this.fileBuilderForm.valueChanges.pipe(
        map((val) => val.docType === 'sql'),
        startWith('sql')
    );

    private _needAddDefaultColumns: boolean = true;

    public get needAddDefaultColumns(): boolean {
        return this._needAddDefaultColumns;
    }

    constructor() {
        this.handleValueChanges();
    }

    public disableAddingDefaultColumns(): void {
        this._needAddDefaultColumns = false;
    }

    public addNewColumn(): void {
        const newColumn = new FormGroup<TextColumnControl | SqlColumnControl>({
            name: new FormControl('', [Validators.required]) as FormControl,
            type: new FormControl(DEFAULT_COLUMN_DATA.type, [Validators.required]) as FormControl,
            max: new FormControl(DEFAULT_COLUMN_DATA.max, [Validators.required, Validators.max(30), Validators.min(11)]) as FormControl,
            min: new FormControl(DEFAULT_COLUMN_DATA.min, [Validators.required, Validators.max(10), Validators.min(0)]) as FormControl,
            nullValuesPercent: new FormControl(DEFAULT_COLUMN_DATA.nullValuesPercent, [
                Validators.required,
                Validators.max(100),
                Validators.min(0)
            ]) as FormControl,
            isPrimaryKey: new FormControl(DEFAULT_COLUMN_DATA.isPrimaryKey) as FormControl,
            refColumnName: new FormControl('') as FormControl,
            refTableName: new FormControl('') as FormControl
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
            const createTableCtrl = new FormControl(false) as FormControl;
            this.fileBuilderForm.addControl('needCreateSqlTable', createTableCtrl, {
                emitEvent: false
            });

            const tableNameCtrl = new FormControl('my_table', [Validators.required]) as FormControl;
            this.fileBuilderForm.addControl('tableName', tableNameCtrl, {
                emitEvent: false
            });

            this.columnsFormArray.controls.forEach((column) => this.addSqlSpecificControlsInColumn(column));
        } else {
            if (this.fileBuilderForm.contains('needCreateSqlTable') && this.fileBuilderForm.contains('tableName')) {
                this.fileBuilderForm.removeControl('needCreateSqlTable', { emitEvent: false });
                this.fileBuilderForm.removeControl('tableName', { emitEvent: false });
            }

            this.columnsFormArray.controls.forEach((column) => this.deleteSqlSpecificControlsInColumn(column));
        }
    }

    private addSqlSpecificControlsInColumn(column: FormGroup<any>): void {
        if (!column.contains('isPrimaryKey')) {
            const primaryKeyCtrl = new FormControl(DEFAULT_COLUMN_DATA.isPrimaryKey) as FormControl;
            column.addControl('isPrimaryKey', primaryKeyCtrl, { emitEvent: false });
        }
        if (!column.contains('refColumnName')) {
            const refColumnNameCtrl = new FormControl('') as FormControl;
            column.addControl('refColumnName', refColumnNameCtrl, { emitEvent: false });
        }
        if (!column.contains('refTableName')) {
            const refTableNameCtrl = new FormControl('') as FormControl;
            column.addControl('refTableName', refTableNameCtrl, { emitEvent: false });
        }
    }

    private deleteSqlSpecificControlsInColumn(column: FormGroup<any>): void {
        if (column.contains('isPrimaryKey')) column.removeControl('isPrimaryKey');
        if (column.contains('refColumnName')) column.removeControl('refColumnName');
        if (column.contains('refTableName')) column.removeControl('refTableName');
    }
}
