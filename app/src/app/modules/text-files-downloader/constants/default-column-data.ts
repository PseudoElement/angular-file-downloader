import { COLUMN_TYPES, SqlColumnInfo } from '../models/file-builder-types';

export const DEFAULT_COLUMN_DATA: SqlColumnInfo = {
    min: '0',
    max: '20',
    name: 'Default',
    nullValuesPercent: '0',
    type: COLUMN_TYPES.NUMBER,
    isPrimaryKey: false,
    refColumnName: 'RefDefaultName',
    refTableName: 'RefDefaultTable',
    fromDate: new Date(1990, 0, 1),
    toDate: new Date(2030, 0, 1)
};
