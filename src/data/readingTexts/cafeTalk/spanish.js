/**
 * Spanish Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/spanish.js';

// Build all 7 Cafe Talk texts for Spanish using the lexicon
export const spanishCafeTalkTexts = buildAllCafeTalkTexts('spanish', cafeTalkLexicon);
