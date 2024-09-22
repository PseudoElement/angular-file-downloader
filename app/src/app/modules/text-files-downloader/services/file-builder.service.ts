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
import { MAX_CTRL_VALIDATORS, MIN_CTRL_VALIDATORS, NULL_VALUE_PERCENT_VALIDATORS } from '../constants/control-validators';
import { FileBuilderFormObserver } from '../utils/file-builder-form-observer';

@Injectable()
export class FileBuilderService {
    public readonly fileBuilderForm = new FormGroup<FileBuilderForm>({
        columns: new FormArray<FormGroup<TextColumnControl | SqlColumnControl>>([], [Validators.required]),
        docType: new FormControl<DocumentType>(DOCUMENT_TYPE_OPTIONS[0].value, [Validators.required]) as FormControl,
        docName: new FormControl<string>('default', [Validators.required]) as FormControl,
        rowsCount: new FormControl<string>('100', [Validators.required, Validators.max(40_000), Validators.min(1)]) as FormControl,
        needCreateSqlTable: new FormControl<boolean>(false) as FormControl,
        tableName: new FormControl<string>('default_table', [Validators.required]) as FormControl
    });

    public get docTypeControl(): FormControl<DocumentType> {
        return this.fileBuilderForm.controls['docType'];
    }

    public get docNameControl(): FormControl<string> {
        return this.fileBuilderForm.controls['docName'];
    }

    public get rowsCountControl(): FormControl<string> {
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

    private readonly formObserver: FileBuilderFormObserver;

    constructor() {
        this.formObserver = new FileBuilderFormObserver(this.fileBuilderForm);
        this.subscribeOnValueChanges();
    }

    public disableAddingDefaultColumns(): void {
        this._needAddDefaultColumns = false;
    }

    public addNewColumn(): void {
        const newColumn = new FormGroup<TextColumnControl | SqlColumnControl>({
            name: new FormControl('', [Validators.required]) as FormControl,
            type: new FormControl(DEFAULT_COLUMN_DATA.type, [Validators.required]) as FormControl,
            max: new FormControl(DEFAULT_COLUMN_DATA.max, MAX_CTRL_VALIDATORS) as FormControl,
            min: new FormControl(DEFAULT_COLUMN_DATA.min, MIN_CTRL_VALIDATORS) as FormControl,
            nullValuesPercent: new FormControl(DEFAULT_COLUMN_DATA.nullValuesPercent, NULL_VALUE_PERCENT_VALIDATORS) as FormControl,
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

    private subscribeOnValueChanges(): void {
        this.fileBuilderForm.valueChanges.pipe(distinctUntilChanged()).subscribe((val) => {
            this.formObserver.handleDocTypeChange(val as FileBuilderFormValue);
            this.formObserver.handleColumnTypeChange();
        });
    }
}
