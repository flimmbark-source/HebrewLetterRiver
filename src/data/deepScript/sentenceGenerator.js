/**
 * Sentence encounter generator for Deep Script Sentence mode.
 *
 * Generates sentence encounters from curated sentence data.
 * Each encounter contains pre-authored Hebrew sentences with
 * explicit word blocks, rather than template-based random substitution.
 *
 * A generated sentence encounter contains:
 *   - The full sentence as ordered word blocks
 *   - Which words are pack words vs connector words
 *   - The translation prompt (English only, no transliteration)
 *   - Word pools for the two-button generation system
 */

import { getNativeScript } from '../../lib/vocabLanguageAdapter.js';
import {
  getSentencesForPacks,
  hebrewConnectors,
} from './sentenceTemplates.js';

let encounterIdCounter = 0;

/**
 * Transform a curated sentence into an encounter for the combat engine.
 *
 * @param {Object} sentence — curated sentence from sentenceTemplates
 * @param {string[]} packWordPool — all pack words available for generation
 * @param {string[]} connectorWordPool — all connector words available for generation
 * @param {string} languageId
 * @returns {Object} — SentenceEncounter
 */
function curatedSentenceToEncounter(sentence, packWordPool, connectorWordPool, languageId) {
  encounterIdCounter++;

  const wordSlots = sentence.words.map((w, index) => ({
    index,
    targetWord: w.word,
    meaning: '',      // translation is shown at sentence level, not per-word
    correct: false,
    source: w.source, // 'pack' | 'connector'
  }));

  return {
    id: `sent-enc-${encounterIdCounter}`,
    templateId: sentence.id,
    translation: sentence.translation,
    wordSlots,
    packWordPool,
    connectorWordPool,
    languageId,
    selectedPackWordIds: [],
  };
}

/**
 * Select sentences for an expedition with variety.
 * Shuffles and picks up to `count`, cycling if needed.
 *
 * @param {Object[]} available — curated sentences
 * @param {number} count — desired number of encounters
 * @returns {Object[]}
 */
function selectSentences(available, count) {
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we need more than available, cycle with reshuffling
  while (selected.length < count && available.length > 0) {
    const extras = [...available].sort(() => Math.random() - 0.5);
    for (const s of extras) {
      if (selected.length >= count) break;
      selected.push(s);
    }
  }

  return selected;
}

/**
 * Generate a full sentence expedition (a sequence of encounters).
 *
 * @param {Object[]} packWords — DS-format word objects (used for distractor pool)
 * @param {Object} options
 * @param {Set<string>|string[]} options.eligiblePackIds — pack IDs to draw sentences from
 * @param {number} [options.encounterCount=5] — number of sentence encounters
 * @param {string} [options.languageId='hebrew']
 * @returns {{ encounters: Object[], finalEncounterIndex: number }}
 */
export function generateSentenceExpedition(packWords, options = {}) {
  const {
    eligiblePackIds = new Set(),
    encounterCount = 5,
    languageId = 'hebrew',
  } = options;

  // Ensure eligiblePackIds is a Set
  const packIdSet = eligiblePackIds instanceof Set
    ? eligiblePackIds
    : new Set(eligiblePackIds);

  // Get all curated sentences that can be built from these packs
  const availableSentences = getSentencesForPacks(packIdSet);

  if (availableSentences.length === 0) {
    return { encounters: [], finalEncounterIndex: -1 };
  }

  // Select sentences for the expedition
  const selected = selectSentences(availableSentences, encounterCount);

  // Collect all unique pack words and connector words across selected sentences
  const allPackWords = new Set();
  const allConnectorWords = new Set();

  for (const sentence of selected) {
    for (const w of sentence.words) {
      if (w.source === 'pack') {
        allPackWords.add(w.word);
      } else {
        allConnectorWords.add(w.word);
      }
    }
  }

  // Add distractors from the DS-format pack words
  if (packWords && packWords.length > 0) {
    for (const pw of packWords) {
      const nativeWord = getNativeScript(pw);
      if (nativeWord) {
        allPackWords.add(nativeWord);
      }
    }
  }

  // Add extra connectors for variety / distractors
  for (const conn of hebrewConnectors) {
    allConnectorWords.add(conn.word);
  }

  const packWordPool = Array.from(allPackWords);
  const connectorWordPool = Array.from(allConnectorWords);

  // Build encounters
  const encounters = selected.map(sentence =>
    curatedSentenceToEncounter(sentence, packWordPool, connectorWordPool, languageId)
  );

  return {
    encounters,
    finalEncounterIndex: encounters.length - 1,
  };
}
