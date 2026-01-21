/**
 * Helper to get word meanings for sentences
 * Since sentences use a separate wordDictionary in readingTexts/index.js,
 * we need to either convert the sentence to a reading text or access the dictionary directly.
 */

import { getReadingTextById } from '../data/readingTexts/index.js';

/**
 * Get dictionary entries for words in a sentence
 * @param {Object} sentence - Sentence object with id and words array
 * @param {string} practiceLanguageId - Practice language (e.g., 'hebrew')
 * @param {string} appLanguageId - App language (e.g., 'en')
 * @returns {Map<string, {hebrew: string, meaning: string, wordId: string}>} Map of wordId to entry
 */
export function getSentenceWordMeanings(sentence, practiceLanguageId = 'hebrew', appLanguageId = 'en') {
  if (!sentence?.id || !sentence?.words) {
    return new Map();
  }

  // Convert sentence to reading text format (this adds translations and glosses)
  const readingText = getReadingTextById(`sentence-${sentence.id}`, practiceLanguageId);

  if (!readingText) {
    console.warn('[getSentenceWordMeanings] Could not convert sentence to reading text:', sentence.id);
    return new Map();
  }

  const meanings = new Map();
  const glosses = readingText.glosses?.[appLanguageId] || readingText.glosses?.['en'] || {};

  sentence.words.forEach(word => {
    if (!word.wordId) return;

    const meaning = glosses[word.wordId];
    if (meaning) {
      meanings.set(word.wordId, {
        hebrew: word.surface || word.hebrew,
        meaning,
        wordId: word.wordId
      });
    }
  });

  return meanings;
}
