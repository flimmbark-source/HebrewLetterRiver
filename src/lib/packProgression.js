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

  return bridgeBuilderPacks.filter(pack => {
    const state = getPackState(pack, allWordProgress, allCompletions);
    return state === PACK_STATES.LEARNED || state === PACK_STATES.MASTERED;
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
