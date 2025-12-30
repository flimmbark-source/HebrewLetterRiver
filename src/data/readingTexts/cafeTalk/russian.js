/**
 * Russian Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon, cafeTalkTransliterations } from './lexicon/russian.js';
import { getI18nLexicons } from './allLexicons.js';

// Get all lexicons for building translations across app languages
const i18nLexicons = getI18nLexicons();

// Build all Cafe Talk texts for Russian with proper Cyrillic transliterations
export const russianCafeTalkTexts = buildAllCafeTalkTexts('russian', cafeTalkLexicon, i18nLexicons, cafeTalkTransliterations);
