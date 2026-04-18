/**
 * Pack progression utility — derives 4-state learning model for vocab packs.
 *
 * States:
 *   Unseen      — player hasn't played the pack
 *   Introduced  — player has seen words from the pack (Vocab Builder or DS Word mode)
 *   Learned     — player completed either Vocab Builder OR DS Word mode for the pack
 *   Mastered    — player completed BOTH Vocab Builder AND DS Word mode for the pack
 *
 * Sentence mode does NOT affect progression.
 * Sentence mode may only use words from packs in Learned or Mastered state.
 */

import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';
import { getAllWordProgress, getPackProgress, getAllPackCompletions } from './bridgeBuilderStorage.js';
import { getWordsByIds } from '../data/bridgeBuilderWords.js';

// ─── Pack state derivation ─────────────────────────────────

export const PACK_STATES = {
  UNSEEN: 'unseen',
  INTRODUCED: 'introduced',
  LEARNED: 'learned',
  MASTERED: 'mastered',
};

/**
 * Derive the progression state for a single pack.
 *
 * @param {Object} pack — pack definition from bridgeBuilderPacks
 * @param {{ [wordId: string]: Object }} allWordProgress — all word progress data
 * @param {{ [packId: string]: { bridgeBuilderComplete: boolean, deepScriptComplete: boolean } }} allCompletions — pack completion data
 * @returns {'unseen' | 'introduced' | 'learned' | 'mastered'}
 */
export function getPackState(pack, allWordProgress, allCompletions) {
  const completion = allCompletions[pack.id] || {
    bridgeBuilderComplete: false,
    loosePlanksComplete: false,
    deepScriptComplete: false,
  };

  const vocabBuilderComplete = completion.bridgeBuilderComplete || completion.loosePlanksComplete;
  const deepScriptWordComplete = completion.deepScriptComplete;

  // Mastered: both Vocab Builder AND DS Word mode complete
  if (vocabBuilderComplete && deepScriptWordComplete) {
    return PACK_STATES.MASTERED;
  }

  // Learned: either Vocab Builder OR DS Word mode complete
  if (vocabBuilderComplete || deepScriptWordComplete) {
    return PACK_STATES.LEARNED;
  }

  // Check if any words have been seen (introduced)
  const packProgress = getPackProgress(pack, allWordProgress);
  if (packProgress.wordsIntroducedCount > 0) {
    return PACK_STATES.INTRODUCED;
  }

  return PACK_STATES.UNSEEN;
}

/**
 * Get progression states for all packs.
 *
 * @returns {Array<{ pack: Object, state: string }>}
 */
export function getAllPackStates() {
  const allWordProgress = getAllWordProgress();
  const allCompletions = getAllPackCompletions();

  return bridgeBuilderPacks.map(pack => ({
    pack,
    state: getPackState(pack, allWordProgress, allCompletions),
  }));
}

// ─── Sentence-mode eligibility ─────────────────────────────

/**
 * Get packs that are eligible for Sentence mode (Learned or Mastered).
 *
 * @returns {Array<Object>} — array of pack definitions
 */
export function getSentenceEligiblePacks() {
  const allWordProgress = getAllWordProgress();
  const allCompletions = getAllPackCompletions();

  return bridgeBuilderPacks.filter((pack) => {
    const state = getPackState(pack, allWordProgress, allCompletions);
    if (state === PACK_STATES.LEARNED || state === PACK_STATES.MASTERED) return true;
    // Also include packs marked sentence-ready via quiz coverage
    const completion = allCompletions[pack.id];
    return completion?.sentenceReady === true;
  });
}

/**
 * Get all words from sentence-eligible packs.
 * Returns BB word objects with their pack context.
 *
 * @returns {Array<Object>} — array of word objects from bridgeBuilderWords
 */
export function getSentenceEligibleWords() {
  const eligiblePacks = getSentenceEligiblePacks();
  const allWordIds = new Set();
  for (const pack of eligiblePacks) {
    for (const wordId of pack.wordIds) {
      allWordIds.add(wordId);
    }
  }
  return getWordsByIds(Array.from(allWordIds));
}

/**
 * Check if the player has enough learned content to play Sentence mode.
 *
 * @returns {boolean}
 */
export function canPlaySentenceMode() {
  return getSentenceEligiblePacks().length > 0;
}

/**
 * Pick a random eligible pack for Sentence mode.
 *
 * @returns {Object | null} — a random eligible pack, or null if none available
 */
export function pickRandomSentencePack() {
  const eligible = getSentenceEligiblePacks();
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// ─── Sentence readiness ────────────────────────────────────

/**
 * Proportion of a pack's words that the player knows (quiz or gameplay).
 * A word counts as known if quizKnown is true OR its masteryStage is beyond 'new'.
 */
export const SENTENCE_READINESS_THRESHOLD = 0.8;

/**
 * Get sentence readiness for a single pack.
 *
 * @param {Object} pack
 * @param {{ [wordId: string]: Object }} allWordProgress
 * @param {{ [packId: string]: Object }} allCompletions
 * @returns {{ knownWordCount, totalWordCount, coveragePercent, unknownWordIds, isGuidedReady, isFreeReadingReady }}
 */
export function getPackSentenceReadiness(pack, allWordProgress, allCompletions) {
  // Packs completed through normal gameplay are always ready
  const packState = getPackState(pack, allWordProgress, allCompletions ?? {});
  if (packState === PACK_STATES.LEARNED || packState === PACK_STATES.MASTERED) {
    return {
      knownWordCount: pack.wordIds.length,
      totalWordCount: pack.wordIds.length,
      coveragePercent: 100,
      unknownWordIds: [],
      isGuidedReady: true,
      isFreeReadingReady: true,
    };
  }

  const knownWordIds = pack.wordIds.filter((wordId) => {
    const wp = allWordProgress?.[wordId];
    return wp && (wp.quizKnown || wp.masteryStage !== 'new');
  });

  const coveragePercent =
    pack.wordIds.length > 0 ? (knownWordIds.length / pack.wordIds.length) * 100 : 0;

  return {
    knownWordCount: knownWordIds.length,
    totalWordCount: pack.wordIds.length,
    coveragePercent,
    unknownWordIds: pack.wordIds.filter((id) => !knownWordIds.includes(id)),
    isGuidedReady: coveragePercent >= SENTENCE_READINESS_THRESHOLD * 100,
    isFreeReadingReady: coveragePercent >= 95,
  };
}

/**
 * Get sentence readiness for a single sentence based on how many of its
 * words the player currently knows.
 *
 * @param {{ words?: Array<{ wordId?: string }> }} sentence
 * @param {{ [wordId: string]: Object }} allWordProgress
 * @returns {{ knownWordCount, totalWordCount, coveragePercent, unknownWordIds, isGuidedReady, isFreeReadingReady }}
 */
export function getSentenceWordReadiness(sentence, allWordProgress) {
  const wordIds = (sentence?.words ?? []).map((w) => w.wordId).filter(Boolean);
  if (wordIds.length === 0) {
    return {
      knownWordCount: 0,
      totalWordCount: 0,
      coveragePercent: 100,
      unknownWordIds: [],
      isGuidedReady: true,
      isFreeReadingReady: true,
    };
  }

  const knownIds = wordIds.filter((wId) => {
    const wp = allWordProgress?.[wId];
    return wp && (wp.quizKnown || wp.masteryStage !== 'new');
  });

  const coveragePercent = (knownIds.length / wordIds.length) * 100;
  return {
    knownWordCount: knownIds.length,
    totalWordCount: wordIds.length,
    coveragePercent,
    unknownWordIds: wordIds.filter((id) => !knownIds.includes(id)),
    isGuidedReady: coveragePercent >= 80,
    isFreeReadingReady: coveragePercent >= 95,
  };
}
