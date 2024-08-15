import { COLUMN_TYPES, SqlColumnInfo, TextColumnInfo } from '../models/file-builder-types';

export const DEFAULT_COLUMN_DATA: SqlColumnInfo = {
    min: 0,
    max: 10,
    name: 'Default',
    nullValuesPercent: 50,
    type: COLUMN_TYPES.NUMBER,
    isPrimaryKey: false,
    foreignKeyData: {
        refColumnName: 'RefDefaultName',
        refTableName: 'RefDefaultTable'
    }
};
