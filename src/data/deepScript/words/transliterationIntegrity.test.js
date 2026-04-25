import { describe, expect, it } from 'vitest';

import { deepScriptWordsArabic } from './arabic.js';
import { deepScriptWordsAmharic } from './amharic.js';
import { deepScriptWordsBengali } from './bengali.js';
import { deepScriptWordsEnglish } from './english.js';
import { deepScriptWordsFrench } from './french.js';
import { deepScriptWordsHebrew } from './hebrew.js';
import { deepScriptWordsHindi } from './hindi.js';
import { deepScriptWordsJapanese } from './japanese.js';
import { deepScriptWordsMandarin } from './mandarin.js';
import { deepScriptWordsPortuguese } from './portuguese.js';
import { deepScriptWordsRussian } from './russian.js';
import { deepScriptWordsSpanish } from './spanish.js';
import { bridgeBuilderWordsArabic } from '../../bridgeBuilder/words/arabic.js';
import { bridgeBuilderWordsAmharic } from '../../bridgeBuilder/words/amharic.js';
import { bridgeBuilderWordsBengali } from '../../bridgeBuilder/words/bengali.js';
import { bridgeBuilderWordsEnglish } from '../../bridgeBuilder/words/english.js';
import { bridgeBuilderWordsFrench } from '../../bridgeBuilder/words/french.js';
import { bridgeBuilderWordsHebrew } from '../../bridgeBuilder/words/hebrew.js';
import { bridgeBuilderWordsHindi } from '../../bridgeBuilder/words/hindi.js';
import { bridgeBuilderWordsJapanese } from '../../bridgeBuilder/words/japanese.js';
import { bridgeBuilderWordsMandarin } from '../../bridgeBuilder/words/mandarin.js';
import { bridgeBuilderWordsPortuguese } from '../../bridgeBuilder/words/portuguese.js';
import { bridgeBuilderWordsRussian } from '../../bridgeBuilder/words/russian.js';
import { bridgeBuilderWordsSpanish } from '../../bridgeBuilder/words/spanish.js';

const ALL_WORD_SETS = [
  ...deepScriptWordsHebrew,
  ...deepScriptWordsArabic,
  ...deepScriptWordsJapanese,
  ...deepScriptWordsMandarin,
  ...deepScriptWordsRussian,
  ...deepScriptWordsEnglish,
  ...deepScriptWordsSpanish,
  ...deepScriptWordsFrench,
  ...deepScriptWordsPortuguese,
  ...deepScriptWordsHindi,
  ...deepScriptWordsBengali,
  ...deepScriptWordsAmharic,
];

const BRIDGE_BUILDER_WORD_SETS = [
  ...bridgeBuilderWordsHebrew,
  ...bridgeBuilderWordsArabic,
  ...bridgeBuilderWordsJapanese,
  ...bridgeBuilderWordsMandarin,
  ...bridgeBuilderWordsRussian,
  ...bridgeBuilderWordsEnglish,
  ...bridgeBuilderWordsSpanish,
  ...bridgeBuilderWordsFrench,
  ...bridgeBuilderWordsPortuguese,
  ...bridgeBuilderWordsHindi,
  ...bridgeBuilderWordsBengali,
  ...bridgeBuilderWordsAmharic,
];

const LATIN_SCRIPT_LANGUAGES = new Set(['english', 'spanish', 'french', 'portuguese']);

// Legitimate cross-language cognates/loanwords can match exactly.
const EXACT_MATCH_ALLOWLIST = new Set([
  'ds-ja-kimono',
  'ds-ja-origami',
  'ds-menorah',
]);

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s'’`´.-]/g, '');
}

function hasOnlyLatinLikeChars(value) {
  return /^[\p{Script=Latin}\p{Mark}\p{Number}\s'’`´.-]+$/u.test(value || '');
}

function getWordKey(word) {
  const nativeScript = word.nativeScript ?? word.hebrew ?? '';
  const meaning = word.meaning ?? word.english ?? word.translation ?? '';
  const languageId = word.languageId ?? 'hebrew';
  return `${languageId}::${nativeScript}::${meaning}`;
}

describe('Deep Script transliteration integrity', () => {
  it('covers every supported Deep Script language dataset', () => {
    const deepScriptLanguages = new Set(ALL_WORD_SETS.map((word) => word.languageId || 'hebrew'));
    const bridgeBuilderLanguages = new Set(BRIDGE_BUILDER_WORD_SETS.map((word) => word.languageId || 'hebrew'));

    expect(Array.from(deepScriptLanguages).sort()).toEqual([
      'amharic',
      'arabic',
      'bengali',
      'english',
      'french',
      'hebrew',
      'hindi',
      'japanese',
      'mandarin',
      'portuguese',
      'russian',
      'spanish',
    ]);

    expect(Array.from(bridgeBuilderLanguages).sort()).toEqual([
      'amharic',
      'arabic',
      'bengali',
      'english',
      'french',
      'hebrew',
      'hindi',
      'japanese',
      'mandarin',
      'portuguese',
      'russian',
      'spanish',
    ]);
  });

  it('all words provide transliteration text', () => {
    for (const word of ALL_WORD_SETS) {
      expect(word.transliteration, `Missing transliteration for ${word.id}`).toBeTruthy();
    }
  });

  it('non-Latin-script languages use Latin-script transliterations', () => {
    for (const word of ALL_WORD_SETS) {
      if (LATIN_SCRIPT_LANGUAGES.has(word.languageId)) continue;
      expect(
        hasOnlyLatinLikeChars(word.transliteration),
        `${word.id} should use Latin characters for transliteration, got: ${word.transliteration}`
      ).toBe(true);
    }
  });

  it('non-Latin-script languages do not accidentally mirror English meanings', () => {
    for (const word of ALL_WORD_SETS) {
      if (LATIN_SCRIPT_LANGUAGES.has(word.languageId)) continue;
      if (EXACT_MATCH_ALLOWLIST.has(word.id)) continue;

      const translit = normalize(word.transliteration);
      const meaning = normalize(word.meaning || word.english);
      expect(
        translit,
        `Expected non-empty transliteration normalization for ${word.id}`
      ).toBeTruthy();
      expect(
        translit,
        `${word.id} transliteration appears to match meaning; possible translation copy`
      ).not.toBe(meaning);
    }
  });

  it('uses the same transliteration spelling as Bridge Builder for shared words', () => {
    const bridgeByKey = new Map(
      BRIDGE_BUILDER_WORD_SETS
        .filter((word) => word.transliteration)
        .map((word) => [getWordKey(word), word.transliteration])
    );

    for (const word of ALL_WORD_SETS) {
      const bridgeTransliteration = bridgeByKey.get(getWordKey(word));
      if (!bridgeTransliteration) continue;
      expect(
        word.transliteration,
        `${word.id} transliteration does not match Bridge Builder canonical spelling`
      ).toBe(bridgeTransliteration);
    }
  });
});
