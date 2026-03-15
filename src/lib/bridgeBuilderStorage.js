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

// Future glossary hook: call getAllWordProgress() and join with bridgeBuilderWords
// to render a full glossary view with mastery indicators.
