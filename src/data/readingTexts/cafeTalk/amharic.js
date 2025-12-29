/**
 * Amharic Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/amharic.js';

// Build all 7 Cafe Talk texts for Amharic using the lexicon
export const amharicCafeTalkTexts = buildAllCafeTalkTexts('amharic', cafeTalkLexicon);
