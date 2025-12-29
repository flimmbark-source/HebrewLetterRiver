/**
 * Amharic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/amharic.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all 7 Cafe Talk texts for Amharic using the lexicon
// Pass i18nLexicons so Section Dictionary works for all app languages
export const amharicCafeTalkTexts = buildAllCafeTalkTexts('amharic', cafeTalkLexicon, i18nLexicons);
