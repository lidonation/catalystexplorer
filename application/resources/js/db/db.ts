import Dexie, { Table } from 'dexie';
import { TABLE_INDEXES, DbModels } from './generated-db-schema';


class Cx_db extends Dexie {
    constructor() {
        super('Cx_db');
        this.version(1).stores(TABLE_INDEXES);
    }

}

interface Cx_db extends Record<keyof DbModels, Table<any, string>> { }


export const db = new Cx_db();