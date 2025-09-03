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
            const proposalTypes = setting.proposalType ?? [];
            if (!Array.isArray(proposalTypes)) continue;

            let uniqueTypes = [...new Set(proposalTypes)];

            const hasSubmitted = uniqueTypes.includes('submitted');
            const hasApproved = uniqueTypes.includes('approved');
            const hasComplete = uniqueTypes.includes('complete');
            const hasInProgress = uniqueTypes.includes('in_progress');
            const hasUnfunded = uniqueTypes.includes('unfunded');

            // Rule 1: Submitted should be alone
            if (hasSubmitted) {
                uniqueTypes = ['submitted'];
            } else {
                // Rule 2: approved is mutually exclusive with complete and in_progress
                if (hasApproved && (hasComplete || hasInProgress)) {
                    // Remove complete and in_progress if approved is present
                    uniqueTypes = uniqueTypes.filter(
                        (type) => type !== 'complete' && type !== 'in_progress',
                    );
                } else if ((hasComplete || hasInProgress) && hasApproved) {
                    uniqueTypes = uniqueTypes.filter(
                        (type) => type !== 'approved',
                    );
                }

                const group1Types = ['approved', 'unfunded'];
                const group2Types = ['unfunded', 'complete', 'in_progress'];

                const hasGroup1 = uniqueTypes.some(
                    (type) => type === 'approved',
                );
                const hasGroup2Only = uniqueTypes.some(
                    (type) => type === 'complete' || type === 'in_progress',
                );

                if (hasGroup1 && hasGroup2Only) {
                    const group1Count = uniqueTypes.filter((type) =>
                        group1Types.includes(type),
                    ).length;
                    const group2Count = uniqueTypes.filter((type) =>
                        group2Types.includes(type),
                    ).length;

                    if (group1Count >= group2Count) {
                        uniqueTypes = uniqueTypes.filter(
                            (type) =>
                                type === 'approved' || type === 'unfunded',
                        );
                    } else {
                        uniqueTypes = uniqueTypes.filter(
                            (type) =>
                                type === 'unfunded' ||
                                type === 'complete' ||
                                type === 'in_progress',
                        );
                    }
                }
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
