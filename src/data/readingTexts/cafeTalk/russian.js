/**
 * Russian Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/russian.js';

// Build all 7 Cafe Talk texts for Russian using the lexicon
export const russianCafeTalkTexts = buildAllCafeTalkTexts('russian', cafeTalkLexicon);
