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
import { bridgeBuilderWords } from '../bridgeBuilderWords.js';
import {
  allCuratedSentences,
  getSentencesForPacks,
} from './sentenceTemplates.js';
import {
  getSentenceConnectors,
  findUnknownConnectors,
} from './sentenceConnectors.js';

// Dev-time audit: warn (once) if any sentence uses a connector that isn't in
// the teaching registry. This keeps sentenceConnectors.js the single source
// of truth for both distractors and in-game hint text.
if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
  const missing = findUnknownConnectors(allCuratedSentences);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[sentenceGenerator] Sentences use connectors that are not registered ' +
      'in sentenceConnectors.js — they will still work, but will not have ' +
      'tap-to-peek hints or post-victory translations:',
      missing
    );
  }
}

let encounterIdCounter = 0;

function normalizeMeaning(meaning) {
  return String(meaning || '')
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function meaningTokens(meaning) {
  const normalized = normalizeMeaning(meaning);
  return normalized ? normalized.split(' ') : [];
}

const hebrewWordMeaningLookup = (() => {
  const lookup = new Map();
  for (const word of bridgeBuilderWords) {
    if ((word.languageId || 'hebrew') !== 'hebrew') continue;
    const nativeWord = getNativeScript(word) || word.hebrew;
    if (!nativeWord) continue;
    const meaning = word.meaning || word.translation || '';
    if (meaning) lookup.set(nativeWord, meaning);
  }
  return lookup;
})();

const hebrewConnectorMeaningLookup = (() => {
  const lookup = new Map();
  for (const connector of getSentenceConnectors('hebrew')) {
    const normalized = normalizeMeaning(connector.meaning);
    if (!normalized) continue;
    lookup.set(connector.word, normalized);
  }
  return lookup;
})();

/**
 * Transform a curated sentence into an encounter for the combat engine.
 *
 * @param {Object} sentence — curated sentence from sentenceTemplates
 * @param {string[]} packWordPool — all pack words available for generation
 * @param {string[]} connectorWordPool — all connector words available for generation
 * @param {string} languageId
 * @returns {Object} — SentenceEncounter
 */
function curatedSentenceToEncounter(sentence, packWordPool, connectorWordPool, packWordInfo, languageId) {
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
    packWordInfo, // { [nativeWord]: { transliteration, meaning } }
    languageId,
    selectedPackWordIds: [],
  };
}

function localizeCuratedSentenceWords(sentence, packWords) {
  const normalizedWords = (packWords || [])
    .map((word) => {
      const nativeWord = getNativeScript(word);
      if (!nativeWord) return null;
      const meaning = word.meaning || word.english || word.translation || '';
      return {
        nativeWord,
        transliteration: word.transliteration || '',
        meaning,
        meaningKey: normalizeMeaning(meaning),
      };
    })
    .filter(Boolean);

  if (normalizedWords.length === 0) return [];

  const wordsByMeaning = new Map();
  for (const word of normalizedWords) {
    const key = word.meaningKey;
    if (!key) continue;
    if (!wordsByMeaning.has(key)) wordsByMeaning.set(key, []);
    wordsByMeaning.get(key).push(word);
  }

  const localizedWords = [];
  for (const templateWord of sentence.words) {
    const packMeaning = hebrewWordMeaningLookup.get(templateWord.word) || '';
    const meaningKey = normalizeMeaning(packMeaning) || hebrewConnectorMeaningLookup.get(templateWord.word);
    if (!meaningKey) return null;

    let targetWord = wordsByMeaning.get(meaningKey)?.[0] || null;
    if (!targetWord) {
      const templateTokens = new Set(meaningTokens(meaningKey));
      let bestScore = 0;
      for (const word of normalizedWords) {
        if (!word.meaningKey) continue;
        const wordTokens = meaningTokens(word.meaningKey);
        const overlap = wordTokens.filter(token => templateTokens.has(token)).length;
        if (overlap > bestScore) {
          bestScore = overlap;
          targetWord = word;
        }
      }
      if (bestScore === 0) return null;
    }

    if (!targetWord) return null;

    localizedWords.push({
      word: targetWord.nativeWord,
      source: templateWord.source,
    });
  }

  return localizedWords;
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

  // Index pack words by native script so the post-victory breakdown can
  // show per-word transliteration + meaning the same way connectors do.
  // Also reuse this loop to populate the distractor pool.
  /** @type {Record<string, { transliteration: string, meaning: string }>} */
  const packWordInfo = {};
  if (packWords && packWords.length > 0) {
    for (const pw of packWords) {
      const nativeWord = getNativeScript(pw);
      if (!nativeWord) continue;
      allPackWords.add(nativeWord);
      if (!packWordInfo[nativeWord]) {
        packWordInfo[nativeWord] = {
          transliteration: pw.transliteration || '',
          meaning: pw.meaning || pw.english || pw.translation || '',
        };
      }
    }
  }

  const packWordPool = Array.from(allPackWords);

  if (languageId !== 'hebrew') {
    const localizedSentences = selected.map((sentence) => {
      const localizedWords = localizeCuratedSentenceWords(sentence, packWords);
      if (!localizedWords?.length) return null;
      return { ...sentence, words: localizedWords };
    }).filter(Boolean);

    const localizedPackWordPool = Array.from(new Set(
      localizedSentences.flatMap(sentence =>
        sentence.words.filter(w => w.source === 'pack').map(w => w.word)
      )
    ));

    const localizedConnectorPool = Array.from(new Set(
      localizedSentences.flatMap(sentence =>
        sentence.words.filter(w => w.source === 'connector').map(w => w.word)
      )
    ));

    const localizedEncounters = localizedSentences.map(sentence =>
      curatedSentenceToEncounter(
        sentence,
        localizedPackWordPool,
        localizedConnectorPool,
        packWordInfo,
        languageId
      ));

    return {
      encounters: localizedEncounters,
      finalEncounterIndex: localizedEncounters.length - 1,
    };
  }

  // Add extra connectors for variety / distractors
  for (const conn of getSentenceConnectors(languageId)) {
    allConnectorWords.add(conn.word);
  }

  const connectorWordPool = Array.from(allConnectorWords);

  // Build encounters
  const encounters = selected.map(sentence =>
    curatedSentenceToEncounter(sentence, packWordPool, connectorWordPool, packWordInfo, languageId)
  );

  return {
    encounters,
    finalEncounterIndex: encounters.length - 1,
  };
}
