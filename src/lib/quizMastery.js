/**
 * Quiz mastery application.
 *
 * Called after the skill-check quiz completes to credit the player for
 * knowledge they've already demonstrated.  Used by both OnboardingFlow
 * (first-run) and BridgeBuilderSetup (retake at any time).
 *
 * Thresholds (applied independently per question type):
 *   vocab    ≥ 60% correct → module-1 vocab sections marked practiced
 *                           + overlapping bridge-builder packs fully credited
 *   sentence ≥ 60% correct → module-1 sentence completion synced proportionally
 */

import { bridgeBuilderWords } from '../data/bridgeBuilderWords.js';
import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';
import { learningModules } from '../data/modules/index.ts';
import {
  markVocabSectionPracticed,
  syncSentenceCompletion,
  initializeModuleProgress,
  getModuleProgress,
} from './moduleProgressStorage.ts';
import {
  markPackQuizMastered,
  markWordsQuizIntroduced,
} from './bridgeBuilderStorage.js';

/**
 * Applies mastery credits based on a quiz breakdown object.
 *
 * @param {{ vocab: {correct: number, total: number}, sentence: {correct: number, total: number} }} breakdown
 * @returns {{ masteredPackIds: string[] }}  IDs of packs that were newly credited
 */
export function applyQuizMastery(breakdown) {
  if (!breakdown) return { masteredPackIds: [] };

  const module1 = learningModules.find((m) => m.id === 'module-1');
  const masteredPackIds = [];

  if (module1) {
    // Ensure module-1 progress record exists before writing to it
    if (!getModuleProgress('module-1')) {
      initializeModuleProgress(
        'module-1',
        module1.sentenceIds.length,
        module1.vocabTextIds.length
      );
    }
  }

  const vocabBreakdown = breakdown.vocab;
  const vocabAccuracy =
    vocabBreakdown && vocabBreakdown.total > 0
      ? vocabBreakdown.correct / vocabBreakdown.total
      : 0;

  if (vocabAccuracy >= 0.6) {
    // Credit module-1 vocab sections
    if (module1) {
      module1.vocabTextIds.forEach((id) => markVocabSectionPracticed('module-1', id));
    }

    // Credit every bridge-builder pack whose words overlap the quiz pool
    const quizWordIdSet = new Set(
      bridgeBuilderWords.filter((w) => w.difficulty <= 2).map((w) => w.id)
    );
    const packsToMaster = bridgeBuilderPacks.filter((pack) =>
      pack.wordIds.some((id) => quizWordIdSet.has(id))
    );
    for (const pack of packsToMaster) {
      markPackQuizMastered(pack.id);
      markWordsQuizIntroduced(pack.wordIds);
      masteredPackIds.push(pack.id);
    }
  }

  const sentenceBreakdown = breakdown.sentence;
  if (sentenceBreakdown && sentenceBreakdown.total > 0 && module1) {
    const accuracy = sentenceBreakdown.correct / sentenceBreakdown.total;
    if (accuracy >= 0.6) {
      const sentencesEarned = Math.max(1, Math.floor(accuracy * module1.sentenceIds.length));
      syncSentenceCompletion('module-1', sentencesEarned);
    }
  }

  return { masteredPackIds };
}
