/**
 * French Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/french.js';

// Build all 7 Cafe Talk texts for French using the lexicon
export const frenchCafeTalkTexts = buildAllCafeTalkTexts('french', cafeTalkLexicon);
