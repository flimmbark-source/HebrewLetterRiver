/**
 * English Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/english.js';

// Build all 7 Cafe Talk texts for English using the lexicon
export const englishCafeTalkTexts = buildAllCafeTalkTexts('english', cafeTalkLexicon);
