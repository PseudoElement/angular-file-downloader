import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { COLUMN_TYPES, FileBuilderForm, FileBuilderFormValue, SqlColumnInfo, TextColumnInfo } from '../models/file-builder-types';
import { DownloadSqlReqBody, DownloadTextReqBody, SqlColumnInfoApi, TextColumnInfoApi } from '../models/txt-download-api-types';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SintolLibDynamicComponentService } from 'dynamic-rendering';
import { wait } from 'src/app/utils/wait';

@Injectable()
export class DownloadService {
    private readonly _isDownloading$ = new BehaviorSubject<boolean>(false);

    public readonly isDownloading$ = this._isDownloading$.asObservable();

    public get isDownloading(): boolean {
        return this._isDownloading$.value;
    }

    constructor(private readonly httpApi: HttpApiService, private readonly sintolModalSrv: SintolLibDynamicComponentService) {}

    public async downloadTxtFile(form: FormGroup<FileBuilderForm>, isSqlFile: boolean): Promise<void> {
        if (form.invalid) {
            await this.sintolModalSrv.openConfirmModal(ModalComponent, {
                title: 'Invalid values!',
                text: 'Fill all inputs in form properly.',
                isConfirmModal: false
            });

            form.markAllAsTouched();
            form.markAsDirty();
            return;
        }
        if (this.isDownloading) {
            await this.sintolModalSrv.openConfirmModal(ModalComponent, {
                title: 'Already downloading!',
                text: 'Wait till previous file will be downloaded.',
                isConfirmModal: false
            });
            return;
        }

        const ok = await this.sintolModalSrv.openConfirmModal(ModalComponent, {
            text: 'Are you sure you want to download file?',
            isConfirmModal: true
        });
        if (!ok) return;

        try {
            this.toggleDownloading(true);
            await wait(3000);
            const formValue = form.value as FileBuilderFormValue;
            const path = `download/${isSqlFile ? 'sql-file' : 'txt-file'}`;
            const body = this.convertFormValueToReqBody(formValue, isSqlFile);

            await this.httpApi.downloadFilePost(path, body, formValue.docName);
        } catch (err) {
            console.log('[DownloadService_downloadTxtFile] Error occured: ', err);
        } finally {
            this.toggleDownloading(false);
        }
    }

    private convertFormValueToReqBody(value: FileBuilderFormValue, isSqlFile: boolean): DownloadSqlReqBody | DownloadTextReqBody {
        return isSqlFile
            ? ({
                  doc_name: value.docName,
                  doc_type: value.docType,
                  need_create_table: value.needCreateSqlTable,
                  table_name: value.tableName,
                  rows_count: Number(value.rowsCount),
                  columns_data: value.columns.map((column) => this.convertSqlColumnToApi(column))
              } as DownloadSqlReqBody)
            : ({
                  doc_name: value.docName,
                  doc_type: value.docType,
                  rows_count: Number(value.rowsCount),
                  columns_data: value.columns.map((column) => this.convertTxtColumnToApi(column))
              } as DownloadTextReqBody);
    }

    private convertSqlColumnToApi(columnInfo: SqlColumnInfo): SqlColumnInfoApi {
        return {
            name: columnInfo.name,
            type: columnInfo.type,
            max: this.convertMaxValueToApi(columnInfo),
            min: this.convertMinValueToApi(columnInfo),
            null_values_percent: Number(columnInfo.nullValuesPercent),
            is_primary_key: columnInfo.isPrimaryKey!,
            foreign_key_data: {
                reference_column_name: columnInfo.refColumnName,
                reference_table_name: columnInfo.refTableName
            }
        };
    }

    private convertTxtColumnToApi(columnInfo: TextColumnInfo): TextColumnInfoApi {
        return {
            name: columnInfo.name,
            type: columnInfo.type,
            max: this.convertMaxValueToApi(columnInfo),
            min: this.convertMinValueToApi(columnInfo),
            null_values_percent: Number(columnInfo.nullValuesPercent)
        };
    }

    private convertMinValueToApi(columnInfo: SqlColumnInfo | TextColumnInfo): number {
        if (columnInfo.type === COLUMN_TYPES.DATE) {
            return columnInfo.fromDate!.getTime();
        } else {
            return Number(columnInfo.min);
        }
    }

    private convertMaxValueToApi(columnInfo: SqlColumnInfo | TextColumnInfo): number {
        if (columnInfo.type === COLUMN_TYPES.DATE) {
            return columnInfo.toDate!.getTime();
        } else {
            return Number(columnInfo.max);
        }
    }

    private toggleDownloading(isDownloading: boolean): void {
        this._isDownloading$.next(isDownloading);
    }
}
