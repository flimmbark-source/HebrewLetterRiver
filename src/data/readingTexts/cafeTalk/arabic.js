/**
 * Arabic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/arabic.js';

// Build all 7 Cafe Talk texts for Arabic using the lexicon
export const arabicCafeTalkTexts = buildAllCafeTalkTexts('arabic', cafeTalkLexicon);
