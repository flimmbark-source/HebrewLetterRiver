import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import { getLanguageCode } from './languageUtils.js';
import { normalizeForLanguage } from './readingUtils.js';

const PREFIX_RULES = [
  { text: 'ו', type: 'conjunction', meaningHint: 'and' },
  { text: 'ה', type: 'definite-article', meaningHint: 'the' },
  { text: 'ב', type: 'preposition', meaningHint: 'in/at' },
  { text: 'כ', type: 'preposition', meaningHint: 'as/like' },
  { text: 'ל', type: 'preposition', meaningHint: 'to/for' },
  { text: 'מ', type: 'preposition', meaningHint: 'from' },
  { text: 'ש', type: 'relative', meaningHint: 'that/which' }
];

const SUFFIX_RULES = [
  { text: 'ים', type: 'plural-masc', meaningHint: 'plural (m.)' },
  { text: 'ות', type: 'plural-fem', meaningHint: 'plural (f.)' },
  { text: 'ך', type: 'possessive-2nd', meaningHint: 'your' },
  { text: 'ם', type: 'possessive-3rd-masc', meaningHint: 'their (m.)' },
  { text: 'ן', type: 'possessive-3rd-fem', meaningHint: 'their (f.)' },
  { text: 'ה', type: 'feminine', meaningHint: 'feminine/definite' },
  { text: 'י', type: 'possessive-1st', meaningHint: 'my' }
];

function findDictionaryEntryByText(surface, practiceLanguageId, appLanguageId, t) {
  if (!surface) return null;
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const langCode = getLanguageCode(appLanguageId);

  for (const text of readingTexts) {
    if (!text.tokens) continue;
    const token = text.tokens.find(tok => tok.type === 'word' && tok.text === surface);
    if (!token) continue;

    const translations = text.translations?.[appLanguageId] || text.translations?.[langCode];
    const canonical = translations?.[token.id]?.canonical;
    const meaningKey = text.meaningKeys?.[token.id];
    const meaning = meaningKey ? t?.(meaningKey) : null;

    return {
      wordId: token.id,
      practiceWord: token.text,
      canonical: canonical ? normalizeForLanguage(canonical, appLanguageId) : null,
      meaning: meaning && meaning !== meaningKey ? meaning : null,
      sourceTitle: text.title?.[langCode] || text.title?.[appLanguageId] || text.id
    };
  }

  return null;
}

function stripPrefixes(surface) {
  const prefixes = [];
  let remaining = surface;

  PREFIX_RULES.forEach(rule => {
    if (remaining.startsWith(rule.text) && remaining.length - rule.text.length >= 2) {
      prefixes.push(rule);
      remaining = remaining.slice(rule.text.length);
    }
  });

  return { prefixes, remaining };
}

function stripSuffixes(surface) {
  const suffixes = [];
  let remaining = surface;

  SUFFIX_RULES.forEach(rule => {
    while (remaining.endsWith(rule.text) && remaining.length - rule.text.length >= 2) {
      suffixes.unshift(rule);
      remaining = remaining.slice(0, -rule.text.length);
    }
  });

  return { suffixes, remaining };
}

export function analyzeHebrewMorphology(surface, practiceLanguageId = 'hebrew', appLanguageId = 'en', t, existingEntry = null) {
  if (!surface) return null;
  let confidence = 0.5;
  const notes = [];

  const { prefixes, remaining: afterPrefixes } = stripPrefixes(surface);
  const { suffixes, remaining: baseCandidate } = stripSuffixes(afterPrefixes);

  if (prefixes.length > 0 || suffixes.length > 0) {
    confidence += 0.1 * (prefixes.length + suffixes.length);
    notes.push('Detected common affixes');
  }

  const dictionaryOriginal = existingEntry || findDictionaryEntryByText(surface, practiceLanguageId, appLanguageId, t);
  if (dictionaryOriginal) {
    confidence = Math.min(1, confidence + 0.2);
    notes.push('Matched dictionary with surface form');
  }

  const dictionaryBase =
    (!dictionaryOriginal && baseCandidate && baseCandidate !== surface)
      ? findDictionaryEntryByText(baseCandidate, practiceLanguageId, appLanguageId, t)
      : null;

  if (dictionaryBase) {
    confidence = Math.min(1, confidence + 0.15);
    notes.push('Matched dictionary after stripping affixes');
  }

  const breakdown = {
    original: surface,
    prefixes: prefixes.map(p => ({ text: p.text, type: p.type, meaningHint: p.meaningHint })),
    base: {
      text: baseCandidate || surface,
      dictionaryId: dictionaryBase?.wordId || dictionaryOriginal?.wordId,
      meaningHint: dictionaryBase?.canonical || dictionaryOriginal?.canonical
    },
    suffixes: suffixes.map(s => ({ text: s.text, type: s.type, meaningHint: s.meaningHint })),
    confidence: Math.min(1, confidence),
    notes
  };

  const bestDictionary = dictionaryOriginal || dictionaryBase;
  return { breakdown, dictionaryEntry: bestDictionary };
}

export function formatMorphologyBreakdown(breakdown) {
  if (!breakdown) return null;

  return {
    prefixes: breakdown.prefixes.map(pref => `${pref.text} (${pref.meaningHint})`),
    base: breakdown.base.text,
    suffixes: breakdown.suffixes.map(suf => `${suf.text} (${suf.meaningHint})`),
    confidence: breakdown.confidence,
    notes: breakdown.notes
  };
}
