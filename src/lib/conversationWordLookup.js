/**
 * Helper to extract word meanings for conversation practice lines
 * Uses the sentenceMeaningsLookup from scenarioFactory which is specific to conversation practice
 */

import { sentenceMeaningsLookup } from '../data/conversation/scenarioFactory.ts';

/**
 * Get word meanings for a conversation line
 * @param {Object} line - ConversationLine with sentenceData
 * @returns {Array} Array of {hebrew, meaning, wordId} pairs
 */
export function getConversationWordMeanings(line) {
  if (!line?.sentenceData?.words) {
    console.log('[getConversationWordMeanings] No sentence data or words:', line);
    return [];
  }

  const pairs = [];
  const seenMeanings = new Map();
  const sentence = line.sentenceData;

  console.log('[getConversationWordMeanings] Processing line:', line.id, 'sentence:', sentence.id);

  sentence.words.forEach((word) => {
    // Skip words without content
    if (!word.hebrew) {
      console.log('[getConversationWordMeanings] Skipping word without hebrew:', word);
      return;
    }

    // Try to get meaning from sentenceMeaningsLookup
    const hebrewText = word.surface || word.hebrew;
    let meaning = sentenceMeaningsLookup[hebrewText] || sentenceMeaningsLookup[word.hebrew];

    // If not found in lookup, try by wordId
    if (!meaning && word.wordId) {
      meaning = sentenceMeaningsLookup[word.wordId];
    }

    if (!meaning) {
      console.log('[getConversationWordMeanings] No meaning found for:', hebrewText, 'wordId:', word.wordId);
      return;
    }

    // Handle duplicate meanings by adding disambiguators
    if (seenMeanings.has(meaning)) {
      const count = seenMeanings.get(meaning) + 1;
      seenMeanings.set(meaning, count);
      meaning = `${meaning} (${count})`;
    } else {
      seenMeanings.set(meaning, 1);
    }

    pairs.push({
      hebrew: hebrewText,
      meaning,
      wordId: word.wordId || hebrewText
    });
  });

  console.log('[getConversationWordMeanings] Extracted pairs:', pairs);

  return pairs;
}
