/**
 * Reading texts aggregator - imports all language modules
 * and provides the same API as the old readingTexts.js file
 */

// Import language modules (modular structure)
import { englishReadingTexts } from './languages/english.js';
import { hebrewReadingTexts } from './languages/hebrew.js';

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
 * @param {string} practiceLanguage - Language ID
 * @returns {Array} Reading texts for that language
 */
export function getReadingTextsForLanguage(practiceLanguage) {
  return readingTextsByLanguage[practiceLanguage] || [];
}

/**
 * Get a specific reading text by ID
 * @param {string} textId - Text ID
 * @returns {Object|null} Reading text object or null
 */
export function getReadingTextById(textId) {
  for (const texts of Object.values(readingTextsByLanguage)) {
    const text = texts.find(t => t.id === textId);
    if (text) return text;
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
