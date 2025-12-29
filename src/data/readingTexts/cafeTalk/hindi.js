/**
 * Hindi Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/hindi.js';

// Build all 7 Cafe Talk texts for Hindi using the lexicon
export const hindiCafeTalkTexts = buildAllCafeTalkTexts('hindi', cafeTalkLexicon);
