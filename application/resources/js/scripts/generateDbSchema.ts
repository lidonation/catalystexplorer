import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeTableMap: Record<string, string> = {
    "proposal_comparisons": 'ProposalData',
    "user_setting": 'UserSettingData'
};

const inputFile = path.resolve(__dirname, '../../types/generated.d.ts');
const outputFile = path.resolve(__dirname, '../db/generated-db-schema.ts');

const file = fs.readFileSync(inputFile, 'utf-8');

const typeRegex = /export type (\w+) = {\s*([^}]+)\s*}/g;
const fieldRegex = /(\w+)\??: /g;

const schema: Record<string, string> = {};
const modelLines: string[] = [];

let match;
while ((match = typeRegex.exec(file)) !== null) {
    const [_, typeName, body] = match;

    // Find the matching table name for this type
    const tableEntry = Object.entries(typeTableMap).find(
        ([, value]) => value === typeName
    );

    if (!tableEntry) continue;

    const [tableName] = tableEntry;
    const fields = [...body.matchAll(fieldRegex)].map((m) => m[1]);

    schema[tableName] = fields.join(', ');
    modelLines.push(`    "${tableName}": App.DataTransferObjects.${typeName};`);
}

const output = `// Auto-generated. Do not edit manually.

export const TABLE_INDEXES = ${JSON.stringify(schema, null, 4)};

export interface DbModels {
${modelLines.join('\n')}
}
`;

fs.writeFileSync(outputFile, output);
console.log('✅ DB schema generated.');