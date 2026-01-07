/**
 * Helper functions for calculating vocab and grammar card progress
 */

import { getReadingTextById } from '../data/readingTexts/index.js';
import { getWordTransactions } from './readingResultsStorage.js';

/**
 * Get progress for a vocab or grammar card
 * @param {string} textId - The reading text ID
 * @param {string} practiceLanguageId - Practice language ID (e.g., 'hebrew')
 * @returns {{ correct: number, total: number }} Progress object
 */
export function getCardProgress(textId, practiceLanguageId) {
  // Get the reading text
  const readingText = getReadingTextById(textId, practiceLanguageId);

  if (!readingText) {
    return { correct: 0, total: 0 };
  }

  // Get all words from the reading text (filter out punctuation)
  const words = readingText.tokens?.filter(token => token.type === 'word') || [];
  const total = words.length;

  if (total === 0) {
    return { correct: 0, total: 0 };
  }

  // Get the section ID for looking up results
  const sectionId = readingText.sectionId || 'modules';

  // Count how many words have been guessed correctly
  let correct = 0;
  for (const word of words) {
    const transactions = getWordTransactions(practiceLanguageId, sectionId, word.id);

    // Check if the most recent transaction was correct
    if (transactions.length > 0) {
      const mostRecent = transactions[transactions.length - 1];
      if (mostRecent.isCorrect) {
        correct++;
      }
    }
  }

  return { correct, total };
}

/**
 * Check if a card is fully complete (all words correct)
 * @param {string} textId - The reading text ID
 * @param {string} practiceLanguageId - Practice language ID
 * @returns {boolean} True if all words have been guessed correctly
 */
export function isCardComplete(textId, practiceLanguageId) {
  const progress = getCardProgress(textId, practiceLanguageId);
  return progress.total > 0 && progress.correct === progress.total;
}
