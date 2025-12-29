/**
 * Mandarin Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/mandarin.js';

// Build all 7 Cafe Talk texts for Mandarin using the lexicon
export const mandarinCafeTalkTexts = buildAllCafeTalkTexts('mandarin', cafeTalkLexicon);
