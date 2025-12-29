/**
 * Arabic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/arabic.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all 7 Cafe Talk texts for Arabic using the lexicon
// Pass i18nLexicons so Section Dictionary works for all app languages
export const arabicCafeTalkTexts = buildAllCafeTalkTexts('arabic', cafeTalkLexicon, i18nLexicons);
