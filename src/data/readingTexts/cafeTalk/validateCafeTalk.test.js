/**
 * Cafe Talk Validation Tests
 *
 * Run with: node src/data/readingTexts/cafeTalk/validateCafeTalk.test.js
 */

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

console.log('Running Cafe Talk validation tests...\n');

try {
  assertCafeTalkValid(cafeTalkByLanguage);
  console.log('✅ All Cafe Talk validation tests passed!\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Cafe Talk validation failed:\n');
  console.error(error.message);
  console.error('\nPlease complete all __TODO__ placeholders in Cafe Talk files.');
  console.error('See: src/data/readingTexts/cafeTalk/<language>.js\n');
  process.exit(1);
}
