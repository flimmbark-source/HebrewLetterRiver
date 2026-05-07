import { bridgeBuilderPacks } from './bridgeBuilderPacks.js';
import { languagePacks } from './languages/index.js';
import { getBridgeBuilderWordsSync } from './bridgeBuilder/words/index.js';
import { bridgeBuilderWords } from './bridgeBuilderWords.js';

export const PRACTICE_LANGUAGES = Object.keys(languagePacks);
export const APP_LANGUAGES = Object.keys(languagePacks);

export const JOURNEY_PACKS = [
  { id: 'greetings_01', category: 'starter', stepOrder: 1, modeSequence: ['bridgeBuilder','loosePlanks','dailyReview','deepScript'] },
  { id: 'pronouns_01', category: 'starter', stepOrder: 2 },
  { id: 'family_01', category: 'starter', stepOrder: 3 },
  { id: 'food_01', category: 'starter', stepOrder: 4 }
];

const THEME_BY_PACK = Object.fromEntries(
  bridgeBuilderPacks.map((p) => [p.id, p.theme])
);

const STARTER_COUNT = 5;

export function canonicalLanguageId(input) {
  const value = String(input || '').trim().toLowerCase();
  const aliases = { he: 'hebrew', ru: 'russian', es: 'spanish', en: 'english' };
  return aliases[value] || value;
}

export function getPackWordIds(practiceLanguage, packId) {
  const lang = canonicalLanguageId(practiceLanguage);
  const theme = THEME_BY_PACK[packId];
  if (!theme) return [];

  const pool = lang === 'hebrew' ? bridgeBuilderWords : getBridgeBuilderWordsSync(lang);
  const matching = (Array.isArray(pool) ? pool : []).filter((w) => w.theme === theme);
  return matching.slice(0, STARTER_COUNT).map((w) => w.id);
}

export function validatePracticeLanguagePackCoverage() {
  const rows = [];
  for (const lang of PRACTICE_LANGUAGES) {
    const pool = lang === 'hebrew' ? bridgeBuilderWords : getBridgeBuilderWordsSync(lang);
    const idSet = new Set((pool || []).map((w) => w.id));
    let mapped = 0;
    let valid = true;
    for (const pack of JOURNEY_PACKS) {
      const ids = getPackWordIds(lang, pack.id);
      if (ids.length > 0) mapped += 1;
      const missing = ids.filter((id) => !idSet.has(id));
      if (missing.length) valid = false;
    }
    rows.push({ language: lang, mapped: `${mapped}/${JOURNEY_PACKS.length}`, valid });
  }
  return rows;
}
