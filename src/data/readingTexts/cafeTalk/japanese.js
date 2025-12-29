/**
 * Japanese Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/japanese.js';

// Build all 7 Cafe Talk texts for Japanese using the lexicon
export const japaneseCafeTalkTexts = buildAllCafeTalkTexts('japanese', cafeTalkLexicon);
