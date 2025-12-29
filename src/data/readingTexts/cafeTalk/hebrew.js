/**
 * Hebrew Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon, cafeTalkTransliterations } from './lexicon/hebrew.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all 7 Cafe Talk texts for Hebrew using the lexicon
// Pass transliterations so typing validation uses Hebrew pronunciations, not English meanings
// Pass i18nLexicons so Section Dictionary works for all app languages
export const hebrewCafeTalkTexts = buildAllCafeTalkTexts('hebrew', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
