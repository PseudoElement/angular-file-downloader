import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { COLUMN_TYPES, FileBuilderForm, FileBuilderFormValue, SqlColumnControl, TextColumnControl } from '../models/file-builder-types';
import { MAX_CTRL_VALIDATORS, MIN_CTRL_VALIDATORS } from '../constants/control-validators';
import { DEFAULT_COLUMN_DATA } from '../constants/default-column-data';

export class FileBuilderFormObserver {
    public get columnsFormArray(): FormArray<FormGroup<TextColumnControl | SqlColumnControl>> {
        return this.fileBuilderForm.controls.columns;
    }

    constructor(private readonly fileBuilderForm: FormGroup<FileBuilderForm>) {}

    public handleDocTypeChange(val: FileBuilderFormValue): void {
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

    public handleColumnTypeChange(): void {
        if (!this.columnsFormArray.controls.length) return;

        this.columnsFormArray.controls.forEach((column: FormGroup<any>) => {
            this.handleAutoIncrementSpecificControls(column);
            this.handleDateSpecificControls(column);
            this.handleMinMaxControls(column);
        });
    }

    private handleMinMaxControls(column: FormGroup<any>): any {
        if (column.value.type === COLUMN_TYPES.NUMBER || column.value.type === COLUMN_TYPES.STRING) {
            if (!column.contains('min')) {
                const minCtrl = new FormControl(DEFAULT_COLUMN_DATA.max, MIN_CTRL_VALIDATORS) as FormControl;
                column.addControl('min', minCtrl, { emitEvent: false });
            }
            if (!column.contains('max')) {
                const maxCtrl = new FormControl(DEFAULT_COLUMN_DATA.max, MAX_CTRL_VALIDATORS) as FormControl;
                column.addControl('max', maxCtrl, { emitEvent: false });
            }
        } else {
            if (column.contains('max')) column.removeControl('max', { emitEvent: false });
            if (column.contains('min')) column.removeControl('min', { emitEvent: false });
        }
    }

    private handleDateSpecificControls(column: FormGroup<any>): any {
        if (column.value.type === COLUMN_TYPES.DATE) {
            if (!column.contains('fromDate')) {
                const fromDateCtrl = new FormControl(null, [Validators.required]) as FormControl;
                column.addControl('fromDate', fromDateCtrl, { emitEvent: false });
            }
            if (!column.contains('toDate')) {
                const toDateCtrl = new FormControl(null, [Validators.required]) as FormControl;
                column.addControl('toDate', toDateCtrl, { emitEvent: false });
            }
        } else {
            if (column.contains('fromDate')) column.removeControl('fromDate', { emitEvent: false });
            if (column.contains('toDate')) column.removeControl('toDate', { emitEvent: false });
        }
    }

    private handleAutoIncrementSpecificControls(column: FormGroup<any>): void {
        if (column.value.type === COLUMN_TYPES.AUTO_INCREMENT && column.contains('min')) {
            column.removeControl('min', { emitEvent: false });
        }
        if (column.value.type === COLUMN_TYPES.AUTO_INCREMENT && column.contains('max')) {
            column.removeControl('max', { emitEvent: false });
        }
        if (column.value.type !== COLUMN_TYPES.AUTO_INCREMENT && !column.contains('min')) {
            const minCtrl = new FormControl('0', MIN_CTRL_VALIDATORS) as FormControl;
            column.addControl('min', minCtrl, { emitEvent: false });
        }
        if (column.value.type !== COLUMN_TYPES.AUTO_INCREMENT && !column.contains('max')) {
            const maxCtrl = new FormControl('0', MAX_CTRL_VALIDATORS) as FormControl;
            column.addControl('max', maxCtrl, { emitEvent: false });
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
        if (column.contains('isPrimaryKey')) column.removeControl('isPrimaryKey', { emitEvent: false });
        if (column.contains('refColumnName')) column.removeControl('refColumnName', { emitEvent: false });
        if (column.contains('refTableName')) column.removeControl('refTableName', { emitEvent: false });
    }
}
