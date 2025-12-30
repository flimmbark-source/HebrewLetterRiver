/**
 * Spanish Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/spanish.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Spanish uses Latin script, so transliterations are the same as the lexicon
const cafeTalkTransliterations = cafeTalkLexicon;

// Build all Cafe Talk texts for Spanish using the lexicon
// Pass transliterations so typing validation uses Spanish words
export const spanishCafeTalkTexts = buildAllCafeTalkTexts('spanish', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
