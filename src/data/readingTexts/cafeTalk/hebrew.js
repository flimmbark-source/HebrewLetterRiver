/**
 * Hebrew Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon, cafeTalkTransliterations, cafeTalkVowelLayouts } from './lexicon/hebrew.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all Cafe Talk texts for Hebrew using the lexicon
// Pass transliterations so typing validation uses Hebrew pronunciations, not English meanings
// Pass i18nLexicons so Section Dictionary works for all app languages
// Pass vowelLayouts to enable vowel layout teaching system
export const hebrewCafeTalkTexts = buildAllCafeTalkTexts('hebrew', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations, cafeTalkVowelLayouts);
