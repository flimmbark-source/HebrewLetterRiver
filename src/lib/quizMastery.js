/**
 * Quiz mastery application — evidence-linked.
 *
 * Called after a skill-check quiz completes to credit the player only for
 * words and packs that were directly represented in their quiz questions.
 *
 * Design principle: a brief quiz proves familiarity, not full mastery.
 * It can mark words as quiz-known and make packs sentence-ready, but it
 * does NOT complete Bridge Builder, Loose Planks, or Deep Script modes.
 *
 * Credit rules:
 *   - Correct vocab answer  → that word is marked quizKnown
 *   - Pack coverage ≥ 80%  → pack is marked sentenceReady (not game-complete)
 *   - Sentence questions contribute sentence IDs for future use
 */

import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  markWordQuizKnown,
  setPackSentenceReady,
} from './bridgeBuilderStorage.js';

const SENTENCE_READY_THRESHOLD = 0.8;

/**
 * Build a reverse index: wordId → [packId, ...] from all bridge builder packs.
 */
function buildWordToPackIndex() {
  const index = {};
  for (const pack of bridgeBuilderPacks) {
    for (const wordId of pack.wordIds) {
      if (!index[wordId]) index[wordId] = [];
      index[wordId].push(pack.id);
    }
  }
  return index;
}

/**
 * Apply quiz mastery credits based on per-question evidence.
 *
 * @param {Array<{
 *   questionId: string,
 *   type: 'letter' | 'vocab' | 'sentence',
 *   wasCorrect: boolean,
 *   linkedWordIds: string[],
 *   linkedSentenceIds: string[],
 *   skill: string,
 * }>} evidence — one record per question shown to the player
 *
 * @param {{ vocab: {correct: number, total: number}, sentence: {correct: number, total: number} }} breakdown
 *   — per-type score summary (kept for routing / skill-level decisions upstream)
 *
 * @returns {{
 *   correctWordIds: string[],
 *   testedWordIds: string[],
 *   sentenceReadyPackIds: string[],
 * }}
 */
export function applyQuizMastery(evidence, breakdown) {
  if (!evidence || evidence.length === 0) {
    return { correctWordIds: [], testedWordIds: [], sentenceReadyPackIds: [] };
  }

  // ── Step 1: Collect tested and correctly-answered word IDs ──────────────
  const correctWordIds = new Set();
  const testedWordIds = new Set();

  for (const record of evidence) {
    for (const wordId of record.linkedWordIds) {
      testedWordIds.add(wordId);
      if (record.wasCorrect) {
        correctWordIds.add(wordId);
      }
    }
  }

  // ── Step 2: Mark correctly-answered words as quiz-known ─────────────────
  for (const wordId of correctWordIds) {
    markWordQuizKnown(wordId);
  }

  // ── Step 3: Recompute pack coverage and mark sentence-ready packs ───────
  // Re-read progress after the writes above so coverage is accurate.
  const allWordProgress = getAllWordProgress();
  const sentenceReadyPackIds = [];

  for (const pack of bridgeBuilderPacks) {
    if (!pack.wordIds || pack.wordIds.length === 0) continue;

    const knownCount = pack.wordIds.filter((wId) => {
      const wp = allWordProgress[wId];
      return wp && (wp.quizKnown || wp.masteryStage !== 'new');
    }).length;

    const coverage = knownCount / pack.wordIds.length;
    if (coverage >= SENTENCE_READY_THRESHOLD) {
      setPackSentenceReady(pack.id);
      sentenceReadyPackIds.push(pack.id);
    }
  }

  return {
    correctWordIds: Array.from(correctWordIds),
    testedWordIds: Array.from(testedWordIds),
    sentenceReadyPackIds,
  };
}
