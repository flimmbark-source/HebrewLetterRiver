/**
 * Reading texts aggregator - imports all language modules
 * and provides the same API as the old readingTexts.js file
 */

// Import language modules (modular structure)
import { englishReadingTexts } from './languages/english.js';
import { hebrewReadingTexts } from './languages/hebrew.js';

// Import Cafe Talk modules
import { hebrewCafeTalkTexts } from './cafeTalk/hebrew.js';
import { arabicCafeTalkTexts } from './cafeTalk/arabic.js';
import { mandarinCafeTalkTexts } from './cafeTalk/mandarin.js';
import { hindiCafeTalkTexts } from './cafeTalk/hindi.js';
import { englishCafeTalkTexts } from './cafeTalk/english.js';
import { spanishCafeTalkTexts } from './cafeTalk/spanish.js';
import { frenchCafeTalkTexts } from './cafeTalk/french.js';
import { portugueseCafeTalkTexts } from './cafeTalk/portuguese.js';
import { russianCafeTalkTexts } from './cafeTalk/russian.js';
import { japaneseCafeTalkTexts } from './cafeTalk/japanese.js';
import { bengaliCafeTalkTexts } from './cafeTalk/bengali.js';
import { amharicCafeTalkTexts } from './cafeTalk/amharic.js';

// Temporarily import from old file for languages not yet migrated
import {
  arabicReadingTexts,
  mandarinReadingTexts,
  hindiReadingTexts,
  spanishReadingTexts,
  frenchReadingTexts,
  portugueseReadingTexts,
  russianReadingTexts,
  japaneseReadingTexts,
  bengaliReadingTexts,
  amharicReadingTexts
} from '../readingTexts.js';

/**
 * Add sectionId to texts
 * @param {Array} texts - Reading texts
 * @param {string} sectionId - Section identifier
 * @returns {Array} Texts with sectionId added
 */
function addSectionId(texts, sectionId) {
  return texts.map(text => ({ ...text, sectionId }));
}

function normalizeLanguageId(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/**
 * Cafe Talk texts by language
 */
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

// Validation: Run in development to ensure Cafe Talk texts are complete
if (import.meta.env?.DEV || import.meta.env?.MODE === 'test') {
  import('./cafeTalk/validateCafeTalk.js').then(({ assertCafeTalkValid }) => {
    try {
      assertCafeTalkValid(cafeTalkByLanguage);
      console.log('✓ Cafe Talk validation passed');
    } catch (error) {
      console.error('✗ Cafe Talk validation failed:', error.message);
      // Don't throw in dev, just warn
      if (import.meta.env?.MODE === 'test') {
        throw error; // But do throw in tests
      }
    }
  }).catch(err => {
    console.error('Failed to load Cafe Talk validator:', err);
  });
}

/**
 * Aggregate all reading texts by practice language
 * This maintains backward compatibility with existing code
 */
export const readingTextsByLanguage = {
  hebrew: hebrewReadingTexts,
  arabic: arabicReadingTexts,
  mandarin: mandarinReadingTexts,
  hindi: hindiReadingTexts,
  english: englishReadingTexts,
  spanish: spanishReadingTexts,
  french: frenchReadingTexts,
  portuguese: portugueseReadingTexts,
  russian: russianReadingTexts,
  japanese: japaneseReadingTexts,
  bengali: bengaliReadingTexts,
  amharic: amharicReadingTexts
};

/**
 * Get all reading texts for a specific practice language
 * Includes both Starter and Cafe Talk sections with sectionId
 * @param {string} practiceLanguage - Language ID
 * @returns {Array} Reading texts for that language with sectionId
 */
export function getReadingTextsForLanguage(practiceLanguage) {
  const normalizedLanguage = normalizeLanguageId(practiceLanguage);
  const starterTexts = readingTextsByLanguage[normalizedLanguage] || [];
  const cafeTalkTexts = cafeTalkByLanguage[normalizedLanguage] || [];

  return [
    ...addSectionId(starterTexts, 'starter'),
    ...addSectionId(cafeTalkTexts, 'cafeTalk')
  ];
}

/**
 * Get a specific reading text by ID
 * @param {string} textId - Text ID
 * @returns {Object|null} Reading text object or null
 */
export function getReadingTextById(textId) {
  // Search in starter texts
  for (const texts of Object.values(readingTextsByLanguage)) {
    const text = texts.find(t => t.id === textId);
    if (text) return { ...text, sectionId: 'starter' };
  }

  // Search in Cafe Talk texts
  for (const texts of Object.values(cafeTalkByLanguage)) {
    const text = texts.find(t => t.id === textId);
    if (text) return { ...text, sectionId: 'cafeTalk' };
  }

  return null;
}

// Re-export individual language arrays for direct access
export {
  hebrewReadingTexts,
  arabicReadingTexts,
  mandarinReadingTexts,
  hindiReadingTexts,
  englishReadingTexts,
  spanishReadingTexts,
  frenchReadingTexts,
  portugueseReadingTexts,
  russianReadingTexts,
  japaneseReadingTexts,
  bengaliReadingTexts,
  amharicReadingTexts
};
