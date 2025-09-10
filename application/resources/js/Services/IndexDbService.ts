import { db } from '@/db/db';
import { DbModels } from '@/db/generated-db-schema';
import { IndexableType, liveQuery, PromiseExtended, UpdateSpec } from 'dexie';

type TableName = keyof DbModels;
type PrimaryKey = string;

export class IndexedDBService {
    /** Create a record with optional auto-incremented `order` */
    static async create<K extends TableName>(
        tableName: K,
        data: DbModels[K],
    ): Promise<IndexableType> {
        const table = db[tableName];

        if ('order' in data) {
            const lastItem = await table.orderBy('order').last();
            const nextOrder =
                lastItem?.order != null ? (lastItem.order as number) + 1 : 1;
            data = { ...data, order: nextOrder };
        }

        return table.add(data);
    }

    /** Get a single record by primary key */
    static get<K extends TableName>(tableName: K, hash: PrimaryKey) {
        return db[tableName].get(hash);
    }

    /** Get all records, ordered by `order` if present */
    static async getAll<K extends TableName>(
        tableName: K,
    ): Promise<DbModels[K][]> {
        const table = db[tableName];

        if (table.schema.idxByName['order']) {
            return table.orderBy('order').reverse().toArray();
        }

        return table.toArray();
    }

    /** Update a record */
    static update<K extends TableName>(
        tableName: K,
        hash: PrimaryKey,
        changes: UpdateSpec<DbModels[K]>,
    ): PromiseExtended<number> {
        return db[tableName].update(hash, changes);
    }

    /** Delete a record */
    static remove<K extends TableName>(
        tableName: K,
        hash: PrimaryKey,
    ): PromiseExtended<void> {
        return db[tableName].delete(hash);
    }

    /** Get all records reactively, sorted by `order` if available */
    static liveAll<K extends TableName>(tableName: K) {
        const table = db[tableName];

        return liveQuery(() => {
            if (table.schema.idxByName['order']) {
                return table.orderBy('order').reverse().toArray();
            }

            return table.toArray();
        });
    }

    /** Get one record by primary key reactively */
    static liveById<K extends TableName>(tableName: K, hash: PrimaryKey) {
        return liveQuery(() => db[tableName].get(hash));
    }

    /** Query records by a field value */
    static where<K extends TableName, F extends keyof DbModels[K]>(
        tableName: K,
        field: F,
        value: DbModels[K][F] extends IndexableType ? DbModels[K][F] : never,
    ) {
        return db[tableName]
            .where(field as string)
            .equals(value)
            .toArray();
    }

    /** Reactively query records by a field value */
    static liveWhere<K extends TableName, F extends keyof DbModels[K]>(
        tableName: K,
        field: F,
        value: DbModels[K][F] extends IndexableType ? DbModels[K][F] : never,
    ) {
        return liveQuery(() =>
            db[tableName]
                .where(field as string)
                .equals(value)
                .toArray(),
        );
    }

    /** Reactively query records by field value and sort by `order` if exists */
    static liveWhereOrdered<K extends TableName, F extends keyof DbModels[K]>(
        tableName: K,
        field: F,
        value: DbModels[K][F] extends IndexableType ? DbModels[K][F] : never,
    ) {
        const table = db[tableName];
        return liveQuery(() => {
            const query = table.where(field as string).equals(value);
            return table.schema.idxByName['order']
                ? query.sortBy('order')
                : query.toArray();
        });
    }

    /** Clear all records from a table */
    static async clear<K extends TableName>(tableName: K): Promise<void> {
        return db[tableName].clear();
    }
}
