/**
 * Hebrew Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/hebrew.js';

// Build all 7 Cafe Talk texts for Hebrew using the lexicon
export const hebrewCafeTalkTexts = buildAllCafeTalkTexts('hebrew', cafeTalkLexicon);
