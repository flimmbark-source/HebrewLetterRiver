/**
 * Bridge Builder word progress persistence.
 *
 * Stores per-word mastery data in localStorage under 'hlr.bridgeBuilderProgress'.
 * Designed so a future glossary view can read the same data without modification.
 *
 * Schema per word:
 *   wordId              — stable id from bridgeBuilderWords
 *   timesSeen           — total times the word appeared in a session
 *   transliterationAttempts / transliterationCorrect
 *   meaningAttempts     / meaningCorrect
 *   meaningIntroduced   — whether the meaning has been taught at least once
 *   masteryStage        — 'new' | 'meaning_taught' | 'practicing' | 'learned'
 *   lastSeenAt          — ISO timestamp
 */

import { loadState, saveState } from './storage.js';

const STORAGE_KEY = 'bridgeBuilderProgress';

/** @returns {{ [wordId: string]: WordProgress }} */
export function getAllWordProgress() {
  return loadState(STORAGE_KEY, {});
}

/** @returns {WordProgress} */
export function getWordProgress(wordId) {
  const all = getAllWordProgress();
  return all[wordId] || createDefaultProgress(wordId);
}

function createDefaultProgress(wordId) {
  return {
    wordId,
    timesSeen: 0,
    transliterationAttempts: 0,
    transliterationCorrect: 0,
    meaningAttempts: 0,
    meaningCorrect: 0,
    meaningIntroduced: false,
    masteryStage: 'new',
    lastSeenAt: null,
  };
}

/**
 * Record the result of a transliteration attempt.
 */
export function recordTransliterationAttempt(wordId, correct) {
  const all = getAllWordProgress();
  const wp = all[wordId] || createDefaultProgress(wordId);
  wp.timesSeen += 1;
  wp.transliterationAttempts += 1;
  if (correct) wp.transliterationCorrect += 1;
  wp.lastSeenAt = new Date().toISOString();
  all[wordId] = wp;
  saveState(STORAGE_KEY, all);
  return wp;
}

/**
 * Record that a word's meaning was taught (single reveal plank).
 */
export function recordMeaningIntroduced(wordId) {
  const all = getAllWordProgress();
  const wp = all[wordId] || createDefaultProgress(wordId);
  wp.meaningIntroduced = true;
  if (wp.masteryStage === 'new') {
    wp.masteryStage = 'meaning_taught';
  }
  wp.lastSeenAt = new Date().toISOString();
  all[wordId] = wp;
  saveState(STORAGE_KEY, all);
  return wp;
}

/**
 * Record the result of a meaning (translation) attempt.
 */
export function recordMeaningAttempt(wordId, correct) {
  const all = getAllWordProgress();
  const wp = all[wordId] || createDefaultProgress(wordId);
  wp.meaningAttempts += 1;
  if (correct) wp.meaningCorrect += 1;

  // Advance mastery stage
  if (wp.masteryStage === 'meaning_taught') {
    wp.masteryStage = 'practicing';
  }
  if (wp.masteryStage === 'practicing' && wp.meaningCorrect >= 3 && wp.transliterationCorrect >= 3) {
    wp.masteryStage = 'learned';
  }

  wp.lastSeenAt = new Date().toISOString();
  all[wordId] = wp;
  saveState(STORAGE_KEY, all);
  return wp;
}

/* ═══════════════════════════════════════════════════════════
   Pack progress — derived from word progress
   ═══════════════════════════════════════════════════════════ */

/**
 * Compute progress for a single pack.
 * Derived from per-word progress — no separate storage needed.
 *
 * @param {Object} pack — pack definition from bridgeBuilderPacks
 * @param {{ [wordId: string]: WordProgress }} allProgress — all word progress
 * @returns {{ packId, wordsIntroducedCount, wordsLearnedCount, totalWords, completed, lastPlayedAt }}
 */
export function getPackProgress(pack, allProgress) {
  let wordsIntroducedCount = 0;
  let wordsLearnedCount = 0;
  let lastPlayedAt = null;

  for (const wordId of pack.wordIds) {
    const wp = allProgress[wordId];
    if (!wp) continue;
    if (wp.masteryStage !== 'new') wordsIntroducedCount++;
    if (wp.masteryStage === 'learned') wordsLearnedCount++;
    if (wp.lastSeenAt && (!lastPlayedAt || wp.lastSeenAt > lastPlayedAt)) {
      lastPlayedAt = wp.lastSeenAt;
    }
  }

  return {
    packId: pack.id,
    wordsIntroducedCount,
    wordsLearnedCount,
    totalWords: pack.wordIds.length,
    completed: wordsIntroducedCount >= pack.wordIds.length,
    lastPlayedAt,
  };
}

/**
 * Determine if a pack is unlocked.
 * A pack is unlocked if:
 *   - it has no unlockAfter requirement, OR
 *   - the required prior pack is completed (all words introduced)
 *
 * @param {Object} pack — pack definition
 * @param {Object[]} allPacks — all pack definitions
 * @param {{ [wordId: string]: WordProgress }} allProgress — all word progress
 */
export function isPackUnlocked(/* pack, allPacks, allProgress */) {
  // All packs are currently unlocked — progression gating can be
  // re-enabled later by checking pack.unlockAfter against prior pack completion.
  return true;
}

/**
 * Get word IDs eligible for Random Review mode.
 * Returns words that have been introduced (meaning_taught, practicing, or learned).
 * Excludes brand-new unseen words.
 *
 * Future glossary note: this same filter can power a "practiced words" glossary tab.
 */
export function getReviewEligibleWordIds() {
  const allProgress = getAllWordProgress();
  return Object.values(allProgress)
    .filter(wp => wp.masteryStage !== 'new' && wp.meaningIntroduced)
    .map(wp => wp.wordId);
}

/* ═══════════════════════════════════════════════════════════
   Section progress — derived from pack progress
   ═══════════════════════════════════════════════════════════ */

/**
 * Compute progress for a section.
 * Aggregates progress across all packs in the section.
 *
 * @param {Object} section — section definition from bridgeBuilderSections
 * @param {Object[]} sectionPacks — packs belonging to this section
 * @param {{ [wordId: string]: WordProgress }} allProgress — all word progress
 * @returns {{ sectionId, packsCompleted, totalPacks, wordsIntroducedCount, wordsLearnedCount, totalWords }}
 */
export function getSectionProgress(section, sectionPacks, allProgress) {
  let packsCompleted = 0;
  let wordsIntroducedCount = 0;
  let wordsLearnedCount = 0;
  let totalWords = 0;

  for (const pack of sectionPacks) {
    const pp = getPackProgress(pack, allProgress);
    if (pp.completed) packsCompleted++;
    wordsIntroducedCount += pp.wordsIntroducedCount;
    wordsLearnedCount += pp.wordsLearnedCount;
    totalWords += pp.totalWords;
  }

  return {
    sectionId: section.id,
    packsCompleted,
    totalPacks: sectionPacks.length,
    wordsIntroducedCount,
    wordsLearnedCount,
    totalWords,
  };
}

/**
 * Determine if a section is unlocked.
 * A section is unlocked if:
 *   - it is the first section (order 1), OR
 *   - the previous section (by order) has all packs completed
 *
 * @param {Object} section — section definition
 * @param {Object[]} allSections — all section definitions (sorted by order)
 * @param {Object[]} allPacks — all pack definitions
 * @param {{ [wordId: string]: WordProgress }} allProgress — all word progress
 */
export function isSectionUnlocked(/* section, allSections, allPacks, allProgress */) {
  // All sections are currently unlocked — progression gating can be
  // re-enabled later by checking prior section completion.
  return true;
}

// Future glossary hook: call getAllWordProgress() and join with bridgeBuilderWords
// to render a full glossary view with mastery indicators.
