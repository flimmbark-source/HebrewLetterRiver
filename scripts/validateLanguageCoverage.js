import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePracticeLanguagePackCoverage, APP_LANGUAGES, PRACTICE_LANGUAGES } from '../src/data/journeyPackRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, '../src/i18n');
const dictMap = new Map();
for (const file of fs.readdirSync(i18nDir)) {
  if (!file.endsWith('.json')) continue;
  const full = path.join(i18nDir, file);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  const id = json?.language?.id || file.replace('.json','');
  dictMap.set(id, json);
}
const fallback = dictMap.get('english') || dictMap.get('en') || {};
const namespaces = ['app.nav','profile','settings','dailyReview','streak','bridgeBuilder.vocabJourney','onboarding','achievements'];

function hasPath(obj, pathStr) {
  let cur = obj;
  for (const part of pathStr.split('.')) {
    if (!cur || typeof cur !== 'object' || !(part in cur)) return false;
    cur = cur[part];
  }
  return true;
}

console.log('App language translation coverage:');
for (const lang of APP_LANGUAGES) {
  const dict = dictMap.get(lang) || fallback;
  const present = namespaces.filter((ns) => hasPath(dict, ns)).length;
  console.log(`- ${lang}: ${present}/${namespaces.length} namespaces`);
}

console.log('\nPractice language pack coverage:');
for (const row of validatePracticeLanguagePackCoverage()) {
  console.log(`- ${row.language}: ${row.mapped} starter packs mapped (${row.valid ? 'valid' : 'invalid'})`);
}

console.log(`\nTotals: app=${APP_LANGUAGES.length}, practice=${PRACTICE_LANGUAGES.length}`);
