/**
 * Portuguese Cafe Talk reading texts
 * Built from lexicon using cafeTalkFactory
 */

import { buildAllCafeTalkTexts } from './cafeTalkFactory.js';
import { cafeTalkLexicon } from './lexicon/portuguese.js';

// Build all 7 Cafe Talk texts for Portuguese using the lexicon
export const portugueseCafeTalkTexts = buildAllCafeTalkTexts('portuguese', cafeTalkLexicon);
