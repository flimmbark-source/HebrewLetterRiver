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
    quizKnown: false,
    quizKnownAt: null,
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

/**
 * Return introduced words that should be reviewed now.
 * Lightweight heuristic until full SRS scheduling is wired:
 * - practicing words due after 12h
 * - learned words due after 72h
 * - meaning_taught words due immediately
 */
export function getDueReviewWordIds(now = Date.now()) {
  const allProgress = getAllWordProgress();
  return Object.values(allProgress)
    .filter((wp) => wp.meaningIntroduced && wp.masteryStage !== 'new')
    .filter((wp) => {
      if (!wp.lastSeenAt) return true;
      const elapsed = now - new Date(wp.lastSeenAt).getTime();
      if (wp.masteryStage === 'meaning_taught') return true;
      if (wp.masteryStage === 'practicing') return elapsed >= 12 * 60 * 60 * 1000;
      return elapsed >= 72 * 60 * 60 * 1000;
    })
    .map((wp) => wp.wordId);
}

/**
 * Return introduced words with weak accuracy.
 */
export function getWeakWordIds(minAttempts = 3, threshold = 0.65) {
  const allProgress = getAllWordProgress();
  return Object.values(allProgress)
    .filter((wp) => wp.meaningIntroduced && wp.masteryStage !== 'new')
    .filter((wp) => {
      const totalAttempts = wp.transliterationAttempts + wp.meaningAttempts;
      if (totalAttempts < minAttempts) return false;
      const correct = wp.transliterationCorrect + wp.meaningCorrect;
      return (correct / totalAttempts) < threshold;
    })
    .map((wp) => wp.wordId);
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
export function getSectionProgress(section, sectionPacks, allProgress, packCompletions) {
  let packsCompleted = 0;
  let wordsIntroducedCount = 0;
  let wordsLearnedCount = 0;
  let totalWords = 0;

  for (const pack of sectionPacks) {
    const pp = getPackProgress(pack, allProgress);
    const comp = packCompletions?.[pack.id];
    const isFullyComplete = comp?.loosePlanksComplete && comp?.deepScriptComplete;
    if (isFullyComplete) packsCompleted++;
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

/* ═══════════════════════════════════════════════════════════
   Pack completion — 2-step progression (Bridge Builder → Loose Planks)
   ═══════════════════════════════════════════════════════════ */

const PACK_COMPLETION_KEY = 'bridgeBuilderPackCompletion';

/**
 * Get completion state for a pack.
 * @returns {{ bridgeBuilderComplete: boolean, loosePlanksComplete: boolean, deepScriptComplete: boolean }}
 */
export function getPackCompletion(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  return all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
}

/**
 * Get completion state for all packs.
 * @returns {{ [packId: string]: { bridgeBuilderComplete: boolean, loosePlanksComplete: boolean } }}
 */
export function getAllPackCompletions() {
  return loadState(PACK_COMPLETION_KEY, {});
}

/**
 * Mark a pack's Bridge Builder pass as complete.
 */
export function markBridgeBuilderComplete(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  entry.bridgeBuilderComplete = true;
  all[packId] = entry;
  saveState(PACK_COMPLETION_KEY, all);
}

/**
 * Mark a pack's Loose Planks pass as complete.
 */
export function markLoosePlanksComplete(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  entry.loosePlanksComplete = true;
  all[packId] = entry;
  saveState(PACK_COMPLETION_KEY, all);
}

/**
 * Mark a pack's Deep Script run as complete.
 */
export function markDeepScriptComplete(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  entry.deepScriptComplete = true;
  all[packId] = entry;
  saveState(PACK_COMPLETION_KEY, all);
}

/**
 * Mark a pack as mastered via the onboarding skill-check quiz.
 * Uses the existing completion markers to fully credit all three game modes,
 * then also stamps quizMastered so the UI can show a distinguishing badge.
 */
export function markPackQuizMastered(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  entry.bridgeBuilderComplete = true;
  entry.loosePlanksComplete = true;
  entry.deepScriptComplete = true;
  entry.quizMastered = true;
  entry.quizMasteredAt = new Date().toISOString();
  all[packId] = entry;
  saveState(PACK_COMPLETION_KEY, all);
}

/**
 * Mark a pack as quiz-attempted (badge only, no completion flags).
 * Used when the player answered vocab questions in the skill check but
 * scored below the mastery threshold — the pack was tested but not passed.
 */
export function markPackQuizBadge(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  if (!entry.quizMastered) {
    entry.quizMastered = true;
    entry.quizMasteredAt = new Date().toISOString();
    all[packId] = entry;
    saveState(PACK_COMPLETION_KEY, all);
  }
}

/**
 * Mark a single word as known via quiz evidence.
 * This is distinct from gameplay mastery — it means the player correctly
 * identified this word's meaning in a skill-check quiz.
 */
export function markWordQuizKnown(wordId) {
  const all = getAllWordProgress();
  const wp = all[wordId] || createDefaultProgress(wordId);
  if (!wp.quizKnown) {
    wp.quizKnown = true;
    wp.quizKnownAt = new Date().toISOString();
    all[wordId] = wp;
    saveState(STORAGE_KEY, all);
  }
}

/**
 * Mark a pack as sentence-ready based on quiz coverage.
 * Does NOT set game-mode completion flags — only signals that enough
 * of the pack's words are quiz-known to support sentence scaffolding.
 */
export function setPackSentenceReady(packId) {
  const all = loadState(PACK_COMPLETION_KEY, {});
  const entry = all[packId] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  if (!entry.sentenceReady) {
    entry.sentenceReady = true;
    entry.sentenceReadyAt = new Date().toISOString();
    all[packId] = entry;
    saveState(PACK_COMPLETION_KEY, all);
  }
}

/**
 * Bulk-introduce a set of words as quiz-credited.
 * Moves each word from 'new' → 'meaning_taught' so the pack shows as started
 * on the guided path and the words are eligible for spaced-repetition review.
 * Words already past 'new' are left untouched.
 *
 * @param {string[]} wordIds
 */
export function markWordsQuizIntroduced(wordIds) {
  const all = getAllWordProgress();
  const now = new Date().toISOString();
  let changed = false;
  for (const wordId of wordIds) {
    const wp = all[wordId] || createDefaultProgress(wordId);
    if (wp.masteryStage === 'new') {
      wp.meaningIntroduced = true;
      wp.masteryStage = 'meaning_taught';
      wp.lastSeenAt = now;
      all[wordId] = wp;
      changed = true;
    }
  }
  if (changed) saveState(STORAGE_KEY, all);
}

// Future glossary hook: call getAllWordProgress() and join with bridgeBuilderWords
// to render a full glossary view with mastery indicators.
