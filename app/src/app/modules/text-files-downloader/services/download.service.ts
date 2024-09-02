import { Injectable } from '@angular/core';
import { HttpApiService } from 'src/app/core/api/http-api.service';
import { FileBuilderFormValue, SqlColumnInfo, TextColumnInfo } from '../models/file-builder-types';
import { DownloadSqlReqBody, DownloadTextReqBody, SqlColumnInfoApi, TextColumnInfoApi } from '../models/txt-download-api-types';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DownloadService {
    private readonly _isDownloading$ = new BehaviorSubject<boolean>(false);

    public readonly isDownloading$ = this._isDownloading$.asObservable();

    constructor(private readonly httpApi: HttpApiService) {}

    public async downloadTxtFile(formValue: FileBuilderFormValue, isSqlFile: boolean): Promise<void> {
        try {
            this.toggleDownloading(true);
            const path = `download/${isSqlFile ? 'sql-file' : 'txt-file'}`;
            const body = this.convertFormValueToReqBody(formValue, isSqlFile);

            await this.httpApi.downloadFilePost(path, body);
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
            max: Number(columnInfo.max),
            min: Number(columnInfo.min),
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
            max: Number(columnInfo.max),
            min: Number(columnInfo.min),
            null_values_percent: Number(columnInfo.nullValuesPercent)
        };
    }

    private toggleDownloading(isDownloading: boolean): void {
        this._isDownloading$.next(isDownloading);
    }
}
