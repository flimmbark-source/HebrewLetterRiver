/**
 * French Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/french.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all 7 Cafe Talk texts for French using the lexicon
// Pass i18nLexicons so Section Dictionary works for all app languages
// French uses Latin script, so transliterations are the same as the lexicon
const cafeTalkTransliterations = cafeTalkLexicon;

export const frenchCafeTalkTexts = buildAllCafeTalkTexts('french', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
