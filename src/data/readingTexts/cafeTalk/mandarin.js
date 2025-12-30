/**
 * Mandarin Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/mandarin.js';
import { cafeTalkLexicon as englishLexicon } from './lexicon/english.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all 7 Cafe Talk texts for Mandarin using the lexicon
// Pass i18nLexicons so Section Dictionary works for all app languages
// Use English words as transliterations for typing
const cafeTalkTransliterations = englishLexicon;

export const mandarinCafeTalkTexts = buildAllCafeTalkTexts('mandarin', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
