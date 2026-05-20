import { describe, expect, it } from 'vitest';
import { assertCafeTalkValid } from './validateCafeTalk.js';
import { hebrewCafeTalkTexts } from './hebrew.js';
import { arabicCafeTalkTexts } from './arabic.js';
import { mandarinCafeTalkTexts } from './mandarin.js';
import { hindiCafeTalkTexts } from './hindi.js';
import { englishCafeTalkTexts } from './english.js';
import { spanishCafeTalkTexts } from './spanish.js';
import { frenchCafeTalkTexts } from './french.js';
import { portugueseCafeTalkTexts } from './portuguese.js';
import { russianCafeTalkTexts } from './russian.js';
import { japaneseCafeTalkTexts } from './japanese.js';
import { bengaliCafeTalkTexts } from './bengali.js';
import { amharicCafeTalkTexts } from './amharic.js';

const cafeTalkByLanguage = {
  hebrew: hebrewCafeTalkTexts,
  arabic: arabicCafeTalkTexts,
  mandarin: mandarinCafeTalkTexts,
  hindi: hindiCafeTalkTexts,
  english: englishCafeTalkTexts,
  spanish: spanishCafeTalkTexts,
  french: frenchCafeTalkTexts,
  portuguese: portugueseCafeTalkTexts,
  russian: russianCafeTalkTexts,
  japanese: japaneseCafeTalkTexts,
  bengali: bengaliCafeTalkTexts,
  amharic: amharicCafeTalkTexts
};

describe('Cafe Talk validation', () => {
  it('has complete and valid Cafe Talk reading texts', () => {
    expect(() => assertCafeTalkValid(cafeTalkByLanguage)).not.toThrow();
  });
});
