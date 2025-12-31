/**
 * Vowel Layout Progress Tracking
 *
 * Manages persistence for:
 * 1. Learned vowel layouts per language (Hebrew)
 * 2. Pack intro modal shown status per pack
 *
 * Uses localStorage via the storage module.
 */

import { loadState, saveState } from './storage.js';

// Storage keys
const LEARNED_LAYOUTS_KEY = 'learnedVowelLayouts';
const PACK_INTRO_SHOWN_KEY = 'vowelLayoutPackIntroShown';

/**
 * Get all learned vowel layouts for a language
 * @param {string} languageCode - Language code (e.g., 'he')
 * @returns {Object} Map of layoutId -> true for learned layouts
 */
export function getLearnedLayouts(languageCode) {
  const allLearned = loadState(LEARNED_LAYOUTS_KEY, {});
  return allLearned[languageCode] || {};
}

/**
 * Mark a vowel layout as learned for a language
 * @param {string} languageCode - Language code (e.g., 'he')
 * @param {string} layoutId - Vowel layout ID (e.g., 'V1_A')
 */
export function setLearnedLayout(languageCode, layoutId) {
  if (!languageCode || !layoutId) {
    console.warn('setLearnedLayout: missing languageCode or layoutId');
    return;
  }

  const allLearned = loadState(LEARNED_LAYOUTS_KEY, {});

  if (!allLearned[languageCode]) {
    allLearned[languageCode] = {};
  }

  allLearned[languageCode][layoutId] = true;

  saveState(LEARNED_LAYOUTS_KEY, allLearned);
}

/**
 * Check if a vowel layout is learned for a language
 * @param {string} languageCode - Language code (e.g., 'he')
 * @param {string} layoutId - Vowel layout ID (e.g., 'V1_A')
 * @returns {boolean} True if learned
 */
export function isLayoutLearned(languageCode, layoutId) {
  const learned = getLearnedLayouts(languageCode);
  return !!learned[layoutId];
}

/**
 * Check if pack intro modal has been shown for a pack
 * @param {string} packId - Pack ID (e.g., 'conversationGlue.basicConnectors')
 * @returns {boolean} True if intro was shown
 */
export function hasShownPackIntro(packId) {
  if (!packId) return false;
  const shownPacks = loadState(PACK_INTRO_SHOWN_KEY, {});
  return !!shownPacks[packId];
}

/**
 * Mark pack intro modal as shown for a pack
 * @param {string} packId - Pack ID (e.g., 'conversationGlue.basicConnectors')
 */
export function setShownPackIntro(packId) {
  if (!packId) {
    console.warn('setShownPackIntro: missing packId');
    return;
  }

  const shownPacks = loadState(PACK_INTRO_SHOWN_KEY, {});
  shownPacks[packId] = true;
  saveState(PACK_INTRO_SHOWN_KEY, shownPacks);
}

/**
 * Reset all learned layouts for a language (for testing/debugging)
 * @param {string} languageCode - Language code (e.g., 'he')
 */
export function resetLearnedLayouts(languageCode) {
  const allLearned = loadState(LEARNED_LAYOUTS_KEY, {});
  delete allLearned[languageCode];
  saveState(LEARNED_LAYOUTS_KEY, allLearned);
}

/**
 * Reset pack intro shown status (for testing/debugging)
 */
export function resetPackIntros() {
  saveState(PACK_INTRO_SHOWN_KEY, {});
}
