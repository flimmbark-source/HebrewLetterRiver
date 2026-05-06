import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePracticeLanguagePackCoverage, APP_LANGUAGES, PRACTICE_LANGUAGES, canonicalLanguageId, JOURNEY_FULLY_SUPPORTED_LANGUAGES } from '../src/data/journeyPackRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const i18nDir = path.join(root, 'src/i18n');

const dictMap = new Map();
for (const file of fs.readdirSync(i18nDir)) {
  if (!file.endsWith('.json')) continue;
  const json = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
  dictMap.set(json?.language?.id || file.replace('.json',''), json);
}
const fallback = dictMap.get('english') || {};

function hasPath(obj, key) {
  let cur = obj;
  for (const part of key.split('.')) {
    if (!cur || typeof cur !== 'object' || !(part in cur)) return false;
    cur = cur[part];
  }
  return true;
}

function collectTKeys(dir) {
  const keys = new Set();
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(js|jsx|ts|tsx)$/.test(f)) {
        const text = fs.readFileSync(p, 'utf8');
        const re = /\bt\(\s*['"]([^'"]+)['"]/g;
        let m; while ((m = re.exec(text))) keys.add(m[1]);
      }
    }
  }; walk(dir); return [...keys].sort();
}

const tKeys = collectTKeys(path.join(root, 'src'));
let hasFailure = false;
console.log('APP_LANGUAGES:', APP_LANGUAGES.join(', '));
console.log('PRACTICE_LANGUAGES:', PRACTICE_LANGUAGES.join(', '));
console.log('JOURNEY_FULLY_SUPPORTED_LANGUAGES:', JOURNEY_FULLY_SUPPORTED_LANGUAGES.join(', '));
console.log('Aliases: he->', canonicalLanguageId('he'), 'ru->', canonicalLanguageId('ru'), 'es->', canonicalLanguageId('es'), 'en->', canonicalLanguageId('en'));

console.log('\nTranslation key coverage (used by t):');
for (const lang of APP_LANGUAGES) {
  const dict = dictMap.get(lang) || fallback;
  const missing = tKeys.filter((k) => !hasPath(dict, k));
  console.log(`- ${lang}: ${(tKeys.length - missing.length)}/${tKeys.length} keys`);
  if (missing.length) {
    hasFailure = true;
    console.log(`  missing: ${missing.slice(0,25).join(', ')}${missing.length>25?' ...':''}`);
  }
}

console.log('\nPractice language pack coverage:');
for (const row of validatePracticeLanguagePackCoverage()) {
  console.log(`- ${row.language}: ${row.mapped}, valid=${row.valid}`);
  if (row.missingPackMappings.length) { hasFailure = true; console.log('  missing pack mappings:', row.missingPackMappings.join(', ')); }
  if (Object.keys(row.invalidWordIds).length) { hasFailure = true; console.log('  invalid word ids:', JSON.stringify(row.invalidWordIds)); }
  if (Object.keys(row.wrongLanguageIds).length) { hasFailure = true; console.log('  wrong-language ids:', JSON.stringify(row.wrongLanguageIds)); }
}

if (hasFailure) {
  console.error('\nvalidateLanguageCoverage: FAILED');
  process.exit(1);
}
console.log('\nvalidateLanguageCoverage: PASS');
