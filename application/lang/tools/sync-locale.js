#!/usr/bin/env node
/*
  sync-locale.js
  - Ensures the target locale file (am.json) contains all keys present in en.json
  - Preserves existing Amharic translations
  - Backfills missing keys with English text so UI never breaks due to missing keys
  - Outputs a summary: total keys, translated keys, missing keys filled
*/

import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../');
const enPath = path.join(root, 'en.json');
const amPath = path.join(root, 'am.json');

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function writeJson(p, obj) {
  const data = JSON.stringify(obj, null, 4) + '\n';
  fs.writeFileSync(p, data, 'utf8');
}

function syncLocales(en, am) {
  const result = { ...am };
  let missing = 0;
  let total = 0;
  let alreadyTranslated = 0;

  for (const key of Object.keys(en)) {
    total++;
    const enVal = en[key];
    const amVal = am[key];

    // If Amharic already has a value and it's different than English, count as translated
    if (typeof amVal === 'string' && amVal.trim() && amVal !== enVal) {
      alreadyTranslated++;
      continue;
    }

    // If missing, backfill with English (to avoid runtime missing strings)
    if (amVal === undefined) {
      result[key] = enVal;
      missing++;
      continue;
    }

    // If present but empty string, also backfill
    if (typeof amVal === 'string' && amVal.trim() === '') {
      result[key] = enVal;
      missing++;
      continue;
    }

    // Otherwise keep existing
    result[key] = amVal;
  }

  return { result, stats: { total, translated: alreadyTranslated, backfilled: missing } };
}

(function main() {
  const en = readJson(enPath);
  const am = readJson(amPath);

  const { result, stats } = syncLocales(en, am);
  writeJson(amPath, result);

  console.log('Locale sync complete');
  console.log(`Total keys:        ${stats.total}`);
  console.log(`Translated (AM):   ${stats.translated}`);
  console.log(`Backfilled (EN):   ${stats.backfilled}`);
})();

