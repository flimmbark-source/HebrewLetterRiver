/**
 * Arabic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/arabic.js';
import { cafeTalkLexicon as englishLexicon } from './lexicon/english.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Use English words as transliterations for typing (e.g., 'so' for لذلك)
const cafeTalkTransliterations = englishLexicon;

// Build all Cafe Talk texts for Arabic
export const arabicCafeTalkTexts = buildAllCafeTalkTexts('arabic', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
