import { db } from '@/db/db';
import { IndexableType, liveQuery, Observable, PromiseExtended, UpdateSpec } from 'dexie';
import { DbModels, TABLE_INDEXES } from '@/db/generated-db-schema';

type TableName = keyof DbModels;
type PrimaryKey = string; 

export class IndexedDBService {
    /** Create a record */
    static create<K extends TableName>(
        tableName: K,
        data: DbModels[K]
    ){
        return db[tableName].add(data);
    }

    /** Read one */
    static get<K extends TableName>(
        tableName: K,
        hash: PrimaryKey
    ){
        return db[tableName].get(hash);
    }

    /** Read all */
    static getAll<K extends TableName>(
        tableName: K
    ){
        return db[tableName].toArray();
    }

    /** Update */
    static update<K extends TableName>(
        tableName: K,
        hash: PrimaryKey,
        changes: UpdateSpec<DbModels[K]>
    ): PromiseExtended<number> {
        return db[tableName].update(hash, changes);
    }

    /** Delete */
    static remove<K extends TableName>(
        tableName: K,
        hash: PrimaryKey
    ): PromiseExtended<void> {
        return db[tableName].delete(hash);
    }

    /** Live all */
    static liveAll<K extends TableName>(
        tableName: K
    ) {
        return liveQuery(() => db[tableName].toArray());
    }

    /** Live get by ID */
    static liveById<K extends TableName>(
        tableName: K,
        hash: PrimaryKey
    ) {
        return liveQuery(() => db[tableName].get(hash));
    }

    /** Query by field */
    static where<K extends TableName, F extends keyof DbModels[K]>(
        tableName: K,
        field: string,
        value: DbModels[K][F] extends IndexableType ? DbModels[K][F] : never
    ){
        return db[tableName]
            .where(field)
            .equals(value)
            .toArray();
    }

    /** Live query by field */
    static liveWhere<K extends TableName, F extends keyof DbModels[K]>(
        tableName: K,
        field: F,
        value: DbModels[K][F] extends IndexableType ? DbModels[K][F] : never
    ) {
        return liveQuery(() =>
            db[tableName]
                .where(field as string)
                .equals(value)
                .toArray()
        );
    }
}