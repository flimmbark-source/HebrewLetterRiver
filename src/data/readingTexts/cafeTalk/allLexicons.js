/**
 * All Cafe Talk Lexicons
 * Centralized import of all language lexicons for building translations
 */

import { cafeTalkLexicon as english } from './lexicon/english.js';
import { cafeTalkLexicon as spanish } from './lexicon/spanish.js';
import { cafeTalkLexicon as french } from './lexicon/french.js';
import { cafeTalkLexicon as portuguese } from './lexicon/portuguese.js';
import { cafeTalkLexicon as russian } from './lexicon/russian.js';
import { cafeTalkLexicon as mandarin } from './lexicon/mandarin.js';
import { cafeTalkLexicon as japanese } from './lexicon/japanese.js';
import { cafeTalkLexicon as hindi } from './lexicon/hindi.js';
import { cafeTalkLexicon as bengali } from './lexicon/bengali.js';
import { cafeTalkLexicon as arabic } from './lexicon/arabic.js';
import { cafeTalkLexicon as hebrew } from './lexicon/hebrew.js';
import { cafeTalkLexicon as amharic } from './lexicon/amharic.js';

/**
 * All lexicons mapped by language ID
 * Used for building translations across all app languages
 */
export const allLexicons = {
  english,
  spanish,
  french,
  portuguese,
  russian,
  mandarin,
  japanese,
  hindi,
  bengali,
  arabic,
  hebrew,
  amharic
};

/**
 * Map internal language IDs to i18n language codes
 */
export const languageToI18nCode = {
  english: 'en',
  spanish: 'es',
  french: 'fr',
  portuguese: 'pt',
  russian: 'ru',
  mandarin: 'zh',
  japanese: 'ja',
  hindi: 'hi',
  bengali: 'bn',
  arabic: 'ar',
  hebrew: 'he',
  amharic: 'am'
};

/**
 * Get lexicons mapped by i18n codes
 * This is used by the factory to build translations for all app languages
 */
export function getI18nLexicons() {
  const i18nLexicons = {};
  Object.keys(allLexicons).forEach(langId => {
    const i18nCode = languageToI18nCode[langId];
    i18nLexicons[i18nCode] = allLexicons[langId];
  });
  return i18nLexicons;
}
