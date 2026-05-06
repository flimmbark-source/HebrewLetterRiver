import { bridgeBuilderPacks } from './bridgeBuilderPacks.js';
import { languagePacks } from './languages/index.js';
import { bridgeBuilderWords } from './bridgeBuilderWords.js';
import { bridgeBuilderWordsRussian } from './bridgeBuilder/words/russian.js';
import { bridgeBuilderWordsSpanish } from './bridgeBuilder/words/spanish.js';
import { bridgeBuilderWordsFrench } from './bridgeBuilder/words/french.js';
import { bridgeBuilderWordsArabic } from './bridgeBuilder/words/arabic.js';
import { bridgeBuilderWordsPortuguese } from './bridgeBuilder/words/portuguese.js';
import { bridgeBuilderWordsJapanese } from './bridgeBuilder/words/japanese.js';
import { bridgeBuilderWordsMandarin } from './bridgeBuilder/words/mandarin.js';
import { bridgeBuilderWordsHindi } from './bridgeBuilder/words/hindi.js';
import { bridgeBuilderWordsBengali } from './bridgeBuilder/words/bengali.js';
import { bridgeBuilderWordsAmharic } from './bridgeBuilder/words/amharic.js';
import { bridgeBuilderWordsEnglish } from './bridgeBuilder/words/english.js';

export const PRACTICE_LANGUAGES = Object.keys(languagePacks);
export const APP_LANGUAGES = Object.keys(languagePacks);

export const JOURNEY_PACKS = [
  { id: 'greetings_01', category: 'starter', stepOrder: 1, modeSequence: ['bridgeBuilder','loosePlanks','dailyReview','deepScript'] },
  { id: 'pronouns_01', category: 'starter', stepOrder: 2 },
  { id: 'family_01', category: 'starter', stepOrder: 3 },
  { id: 'food_01', category: 'starter', stepOrder: 4 }
];

const THEME_BY_PACK = Object.fromEntries(bridgeBuilderPacks.map((p) => [p.id, p.theme]));
const STARTER_COUNT = 5;

const PACK_THEME_PREFERENCES = {
  greetings_01: ['greetings'],
  pronouns_01: ['pronouns', 'greetings'],
  family_01: ['family', 'people', 'places'],
  food_01: ['food', 'food-drink', 'daily', 'daily-life', 'things']
};



const WORD_POOLS = {
  hebrew: bridgeBuilderWords,
  russian: bridgeBuilderWordsRussian,
  spanish: bridgeBuilderWordsSpanish,
  french: bridgeBuilderWordsFrench,
  arabic: bridgeBuilderWordsArabic,
  portuguese: bridgeBuilderWordsPortuguese,
  japanese: bridgeBuilderWordsJapanese,
  mandarin: bridgeBuilderWordsMandarin,
  hindi: bridgeBuilderWordsHindi,
  bengali: bridgeBuilderWordsBengali,
  amharic: bridgeBuilderWordsAmharic,
  english: bridgeBuilderWordsEnglish
};


export function canonicalLanguageId(input) {
  const value = String(input || '').trim().toLowerCase();
  const aliases = { he: 'hebrew', ru: 'russian', es: 'spanish', en: 'english' };
  return aliases[value] || value;
}

export function getPackWordIds(practiceLanguage, packId) {
  const lang = canonicalLanguageId(practiceLanguage);
  const pool = WORD_POOLS[lang] || [];
  const preferredThemes = PACK_THEME_PREFERENCES[packId] || [THEME_BY_PACK[packId]].filter(Boolean);
  if (preferredThemes.length === 0) return [];

  for (const theme of preferredThemes) {
    const matching = pool.filter((w) => w.theme === theme);
    if (matching.length > 0) {
      return matching.slice(0, STARTER_COUNT).map((w) => w.id);
    }
  }
  return [];
}


export function validatePracticeLanguagePackCoverage() {
  const rows = [];
  for (const lang of PRACTICE_LANGUAGES) {
    const pool = WORD_POOLS[lang] || [];
    const words = pool || [];
    const idSet = new Set(words.map((w) => w.id));
    const byId = new Map(words.map((w) => [w.id, w]));
    let mapped = 0;
    const missingPackMappings = [];
    const invalidWordIds = {};
    const wrongLanguageIds = {};
    for (const pack of JOURNEY_PACKS) {
      const ids = getPackWordIds(lang, pack.id);
      if (ids.length > 0) mapped += 1;
      else missingPackMappings.push(pack.id);
      const missing = ids.filter((id) => !idSet.has(id));
      if (missing.length) invalidWordIds[pack.id] = missing;
      const wrongLang = ids.filter((id) => (byId.get(id)?.languageId || lang) !== lang);
      if (wrongLang.length) wrongLanguageIds[pack.id] = wrongLang;
    }
    rows.push({
      language: lang,
      mapped: `${mapped}/${JOURNEY_PACKS.length}`,
      valid: missingPackMappings.length === 0 && Object.keys(invalidWordIds).length === 0 && Object.keys(wrongLanguageIds).length === 0,
      missingPackMappings,
      invalidWordIds,
      wrongLanguageIds
    });
  }
  return rows;
}

export function getWordPoolForLanguage(languageId) {
  return WORD_POOLS[canonicalLanguageId(languageId)] || [];
}

export function isJourneyLanguageFullySupported(languageId) {
  const lang = canonicalLanguageId(languageId);
  return JOURNEY_PACKS.every((pack) => getPackWordIds(lang, pack.id).length > 0);
}

export const JOURNEY_FULLY_SUPPORTED_LANGUAGES = PRACTICE_LANGUAGES.filter(isJourneyLanguageFullySupported);
