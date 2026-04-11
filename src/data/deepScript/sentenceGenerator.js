/**
 * Sentence encounter generator for Deep Script Sentence mode.
 *
 * Generates sentence battles by filling templates with pack words.
 * Reuses the weighted-generation concept from letter-based Deep Script.
 *
 * A generated sentence encounter contains:
 *   - The full sentence as ordered word blocks
 *   - Which words are pack words vs connector words
 *   - The translation prompt (English only, no transliteration)
 *   - Metadata for the two-button generation system
 */

import { getNativeScript, getMeaning } from '../../lib/vocabLanguageAdapter.js';
import {
  hebrewSentenceTemplates,
  getCompatibleTemplates,
  hebrewConnectors,
} from './sentenceTemplates.js';

/**
 * @typedef {Object} SentenceEncounter
 * @property {string}   id — unique encounter identifier
 * @property {string}   templateId — source template
 * @property {string}   translation — English sentence (no transliteration)
 * @property {Array<SentenceWordSlot>} wordSlots — ordered word blocks
 * @property {string[]} packWordPool — all pack words available for generation
 * @property {string[]} connectorWordPool — all connector words available for generation
 */

/**
 * @typedef {Object} SentenceWordSlot
 * @property {number}  index
 * @property {string}  targetWord — the correct word in target script
 * @property {string}  meaning — English meaning of this word
 * @property {boolean} correct — whether this slot has been correctly filled
 * @property {string}  source — 'pack' | 'connector'
 */

let encounterIdCounter = 0;

/**
 * Tags that indicate a word can serve as a 'noun' in templates.
 * Covers both DS-style tags (person, nature, body...) and BB-style tags (nouns, basics).
 */
const NOUN_QUALIFYING_TAGS = new Set([
  // DS-style tags
  'person', 'nature', 'body', 'object', 'animal', 'food', 'place', 'time',
  'concrete', 'abstract', 'common', 'family',
  // BB-style tags
  'nouns', 'basics', 'numbers', 'colors',
]);

/**
 * Check if a word qualifies as a noun for template matching.
 * A word is a noun candidate if it has any noun-qualifying tag,
 * OR if it has no verb/adjective tags (treat generic vocab as nouns).
 */
function isNounCandidate(word) {
  if (!word.tags || word.tags.length === 0) return true; // no tags → treat as noun
  if (word.tags.some(t => NOUN_QUALIFYING_TAGS.has(t))) return true;
  // If word only has non-verb, non-adjective tags, treat as noun
  if (!word.tags.includes('verbs') && !word.tags.includes('adjective')) return true;
  return false;
}

/**
 * Collect all tags from a set of DS-format words.
 * @param {Object[]} words — DS word objects with .tags arrays
 * @returns {Set<string>}
 */
function collectTags(words) {
  const tags = new Set();
  for (const w of words) {
    if (w.tags) {
      for (const t of w.tags) tags.add(t);
    }
  }

  // If any word qualifies as a noun, add the 'noun' tag
  if (words.some(w => isNounCandidate(w))) {
    tags.add('noun');
  }

  if (tags.has('adjective')) tags.add('adjective');
  return tags;
}

/**
 * Find pack words matching a given template tag.
 * @param {Object[]} words — DS word objects
 * @param {string} tag — the required tag
 * @returns {Object[]}
 */
function findWordsByTag(words, tag) {
  if (tag === 'noun') {
    return words.filter(w => isNounCandidate(w));
  }
  return words.filter(w => w.tags && w.tags.includes(tag));
}

/**
 * Generate a single sentence encounter from a template and pack words.
 *
 * @param {Object} template — sentence template definition
 * @param {Object[]} packWords — available pack words (DS format)
 * @param {Set<string>} [usedWordIds] — words already used (for variety)
 * @returns {SentenceEncounter | null}
 */
export function generateSentenceEncounter(template, packWords, usedWordIds = new Set()) {
  // Select pack words for each unique packSlot
  const packSlotCount = template.packTags.length;
  const selectedPackWords = [];

  for (let i = 0; i < packSlotCount; i++) {
    const tag = template.packTags[i];
    const candidates = findWordsByTag(packWords, tag)
      .filter(w => !usedWordIds.has(w.id) && !selectedPackWords.some(sw => sw.id === w.id));

    if (candidates.length === 0) {
      // Fallback: allow reuse if we must
      const fallback = findWordsByTag(packWords, tag)
        .filter(w => !selectedPackWords.some(sw => sw.id === w.id));
      if (fallback.length === 0) return null; // Can't fill this template
      selectedPackWords.push(fallback[Math.floor(Math.random() * fallback.length)]);
    } else {
      selectedPackWords.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
  }

  // Build the word slots
  const wordSlots = template.slots.map((slot, index) => {
    if (slot.type === 'pack') {
      const packWord = selectedPackWords[slot.packSlot];
      const nativeScript = getNativeScript(packWord);
      return {
        index,
        targetWord: nativeScript,
        meaning: getMeaning(packWord),
        correct: false,
        source: 'pack',
        wordId: packWord.id,
      };
    } else {
      const connWord = template.connectorWords[slot.wordIndex];
      const connTranslit = template.connectorTransliterations?.[slot.wordIndex] || '';
      return {
        index,
        targetWord: connWord,
        meaning: connTranslit, // For connectors, store transliteration as a hint
        correct: false,
        source: 'connector',
      };
    }
  });

  // Build the English translation with pack-word meanings filled in
  let translation = template.translation;
  for (let i = 0; i < selectedPackWords.length; i++) {
    translation = translation.replace(`{${i}}`, getMeaning(selectedPackWords[i]));
  }

  encounterIdCounter++;

  // Build the pools for the two-button generation system
  const packWordPool = packWords.map(w => getNativeScript(w));
  const connectorWordPool = template.connectorWords.slice();
  // Also add some extra connectors for variety/distraction
  const extraConnectors = hebrewConnectors
    .map(c => c.word)
    .filter(w => !connectorWordPool.includes(w));
  const shuffledExtras = extraConnectors.sort(() => Math.random() - 0.5).slice(0, 4);
  connectorWordPool.push(...shuffledExtras);

  return {
    id: `sent-enc-${encounterIdCounter}`,
    templateId: template.id,
    translation,
    wordSlots,
    packWordPool,
    connectorWordPool,
    languageId: template.languageId,
    selectedPackWordIds: selectedPackWords.map(w => w.id),
  };
}

/**
 * Generate a full sentence expedition (a sequence of encounters).
 *
 * @param {Object[]} packWords — available pack words (DS format with tags)
 * @param {Object} options
 * @param {number} [options.encounterCount=5] — number of sentence encounters
 * @param {string} [options.languageId='hebrew']
 * @returns {{ encounters: SentenceEncounter[], finalEncounterIndex: number }}
 */
export function generateSentenceExpedition(packWords, options = {}) {
  const {
    encounterCount = 5,
    languageId = 'hebrew',
  } = options;

  const availableTags = collectTags(packWords);
  const templates = getCompatibleTemplates(availableTags, languageId);

  if (templates.length === 0) {
    return { encounters: [], finalEncounterIndex: -1 };
  }

  const encounters = [];
  const usedWordIds = new Set();
  const usedTemplateIds = new Set();

  for (let i = 0; i < encounterCount; i++) {
    // Prefer unused templates, but allow reuse if exhausted
    let templatePool = templates.filter(t => !usedTemplateIds.has(t.id));
    if (templatePool.length === 0) {
      templatePool = templates;
      usedTemplateIds.clear();
    }

    // Weighted random: prefer easier templates early, harder later
    const sorted = [...templatePool].sort((a, b) => a.difficulty - b.difficulty);
    const progressRatio = i / Math.max(1, encounterCount - 1);
    const idx = Math.min(
      sorted.length - 1,
      Math.floor(progressRatio * sorted.length * 0.8 + Math.random() * sorted.length * 0.3)
    );
    const template = sorted[Math.min(idx, sorted.length - 1)];

    const encounter = generateSentenceEncounter(template, packWords, usedWordIds);
    if (encounter) {
      encounters.push(encounter);
      usedTemplateIds.add(template.id);
      for (const wId of encounter.selectedPackWordIds) {
        usedWordIds.add(wId);
      }
    }
  }

  // The last encounter is the "final battle" (replaces boss)
  const finalEncounterIndex = encounters.length - 1;

  return { encounters, finalEncounterIndex };
}
