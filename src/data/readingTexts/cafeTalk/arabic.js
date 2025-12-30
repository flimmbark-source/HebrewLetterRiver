/**
 * Arabic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon, cafeTalkTransliterations } from './lexicon/arabic.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all Cafe Talk texts for Arabic with proper Arabic script transliterations
export const arabicCafeTalkTexts = buildAllCafeTalkTexts('arabic', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
