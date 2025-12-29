/**
 * Bengali Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/bengali.js';

// Build all 7 Cafe Talk texts for Bengali using the lexicon
export const bengaliCafeTalkTexts = buildAllCafeTalkTexts('bengali', cafeTalkLexicon);
