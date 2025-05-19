import Dexie, { Table } from 'dexie';
import { TABLE_INDEXES, DbModels } from './generated-db-schema';

class Cx_db extends Dexie {
    constructor() {
        super('Cx_db');

        const updatedIndexes: Record<string, string> = {};
        for (const [table, indexStr] of Object.entries(TABLE_INDEXES)) {
            const indexParts = indexStr.split(',').map(i => i.trim());
            if (!indexParts.includes('order')) {
                indexParts.push('order');
            }
            updatedIndexes[table] = indexParts.join(',');
        }

        this.version(1).stores(updatedIndexes);
    }
}

interface Cx_db extends Record<keyof DbModels, Table<any, string>> {}

export const db = new Cx_db();