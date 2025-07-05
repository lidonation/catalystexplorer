import Dexie, { Table } from 'dexie';
import { DbModels, TABLE_INDEXES } from './generated-db-schema';

const addOrderIndex = (indexes: Record<string, string>) => {
    const result: Record<string, string> = {};
    for (const [table, indexStr] of Object.entries(indexes)) {
        const fields = indexStr.split(',').map((i) => i.trim());
        if (!fields.includes('order')) fields.push('order');
        result[table] = fields.join(',');
    }
    return result;
};

const CURRENT_SCHEMA = addOrderIndex(TABLE_INDEXES);
const SCHEMA_VERSION = parseInt(import.meta.env.VITE_DB_VERSION || '1', 10);

class Cx_db extends Dexie {
    constructor() {
        super('Cx_db');

        this.version(SCHEMA_VERSION)
            .stores(CURRENT_SCHEMA)
            .upgrade(async (tx) => {
                await this.fixProposalTypeDuplicates(tx);
            });

        this.on('ready', async () => {
            await this.fixProposalTypeDuplicates(this);
        });
    }

    private async fixProposalTypeDuplicates(txOrDb: any) {
        const table = txOrDb.table('user_setting');
        const userSettings = await table.toArray();

        for (const setting of userSettings) {
            let proposalTypes = setting.proposalType ?? [];
            if (!Array.isArray(proposalTypes)) continue;

            let uniqueTypes = [...new Set(proposalTypes)];

            const hasSubmitted = uniqueTypes.includes('submitted');
            const hasOtherTypes = ['approved', 'unfunded', 'complete'].every(
                (type) => uniqueTypes.includes(type),
            );

            if (hasSubmitted && hasOtherTypes) {
                uniqueTypes = uniqueTypes.filter(
                    (type) => type !== 'submitted',
                );
            }

            const changed =
                proposalTypes.length !== uniqueTypes.length ||
                proposalTypes.some((val, idx) => uniqueTypes[idx] !== val);

            if (changed) {
                await table.put({
                    ...setting,
                    proposalType: uniqueTypes,
                });
            }
        }
    }
}

interface Cx_db extends Record<keyof DbModels, Table<any, string>> {}

export const db = new Cx_db();
