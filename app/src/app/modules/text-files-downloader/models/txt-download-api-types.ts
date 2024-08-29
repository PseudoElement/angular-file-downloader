interface CommonReqBody<T> {
    rows_count: number;
    doc_type: string;
    doc_name: string;
    columns_data: T[];
}

interface CommonColumnInfo {
    name: string;
    /**
     * BOOL, NUMBER, STRING, AUTO_INCREMENT, FIRST_NAME, LAST_NAME, COUNTRY, CAR, WORK
     */
    type: string;
    null_values_percent: number;
    min: number;
    max: number;
}

export interface TextColumnInfoApi extends CommonColumnInfo {}

export interface SqlColumnInfoApi extends CommonColumnInfo {
    is_primary_key: boolean;
    foreign_key_data: {
        reference_table_name?: string;
        reference_column_name?: string;
    };
}

export interface DownloadSqlReqBody extends CommonReqBody<SqlColumnInfoApi> {
    table_name: string;
    need_create_table: boolean;
}

export interface DownloadTextReqBody extends CommonReqBody<TextColumnInfoApi> {}
