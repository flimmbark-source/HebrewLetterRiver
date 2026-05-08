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

const PACK_BY_ID = Object.fromEntries(
  bridgeBuilderPacks.map((pack) => [pack.id, pack])
);

export function canonicalLanguageId(input) {
  const value = String(input || '').trim().toLowerCase();
  const aliases = { he: 'hebrew', ru: 'russian', es: 'spanish', en: 'english' };
  return aliases[value] || value;
}

function getWordPool(practiceLanguage) {
  const lang = canonicalLanguageId(practiceLanguage);
  return lang === 'hebrew' ? bridgeBuilderWords : getBridgeBuilderWordsSync(lang);
}

function getEquivalentWordId(wordId, targetPool) {
  if (!wordId) return null;
  const idSet = new Set((targetPool || []).map((word) => word.id));
  if (idSet.has(wordId)) return wordId;

  const canonicalKey = String(wordId)
    .replace(/^bbct-/, '')
    .replace(/^bb-/, '');

  const equivalent = (targetPool || []).find((word) => {
    const poolKey = String(word.id || '')
      .replace(/^bbct-/, '')
      .replace(/^bb-/, '');
    return poolKey === canonicalKey;
  });

  return equivalent?.id || null;
}

export function getPackWordIds(practiceLanguage, packId) {
  const pack = PACK_BY_ID[packId];
  if (!pack?.wordIds?.length) return [];

  const pool = getWordPool(practiceLanguage);
  const resolvedIds = pack.wordIds
    .map((wordId) => getEquivalentWordId(wordId, pool))
    .filter(Boolean);

  return Array.from(new Set(resolvedIds));
}

export function validatePracticeLanguagePackCoverage() {
  const rows = [];
  for (const lang of PRACTICE_LANGUAGES) {
    const pool = getWordPool(lang);
    const idSet = new Set((pool || []).map((w) => w.id));
    let mapped = 0;
    let valid = true;
    for (const pack of bridgeBuilderPacks) {
      const ids = getPackWordIds(lang, pack.id);
      if (ids.length > 0) mapped += 1;
      const missing = ids.filter((id) => !idSet.has(id));
      if (missing.length) valid = false;
    }
    rows.push({ language: lang, mapped: `${mapped}/${bridgeBuilderPacks.length}`, valid });
  }
  return rows;
}
