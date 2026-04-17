/**
 * Quiz mastery application.
 *
 * Called after the skill-check quiz completes to credit the player for
 * knowledge they've already demonstrated.  Used by both OnboardingFlow
 * (first-run) and BridgeBuilderSetup (retake at any time).
 *
 * Thresholds (applied independently per question type):
 *   vocab  > 0% correct  → overlapping packs get the ✦ Quiz badge
 *   vocab  ≥ 60% correct → packs fully credited (all game modes) + module-1 vocab sections practiced
 *   sentence ≥ 60% correct → module-1 sentence completion synced proportionally
 *
 * Two-tier: doing the quiz always marks the badge; passing (≥60%) also marks full completion.
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
  markPackQuizBadge,
  markWordsQuizIntroduced,
} from './bridgeBuilderStorage.js';

/**
 * Applies mastery credits based on a quiz breakdown object.
 *
 * @param {{ vocab: {correct: number, total: number}, sentence: {correct: number, total: number} }} breakdown
 * @returns {{ masteredPackIds: string[] }}  IDs of packs that received full mastery credit
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
  const vocabAnswered = vocabBreakdown && vocabBreakdown.total > 0;
  const vocabAccuracy = vocabAnswered ? vocabBreakdown.correct / vocabBreakdown.total : 0;

  if (vocabAnswered && vocabAccuracy > 0) {
    // Any correct vocab answer → compute the overlapping pack set
    const quizWordIdSet = new Set(
      bridgeBuilderWords.filter((w) => w.difficulty <= 2).map((w) => w.id)
    );
    const overlappingPacks = bridgeBuilderPacks.filter((pack) =>
      pack.wordIds.some((id) => quizWordIdSet.has(id))
    );

    if (vocabAccuracy >= 0.6) {
      // Passed: full credit — all game modes complete + badge
      if (module1) {
        module1.vocabTextIds.forEach((id) => markVocabSectionPracticed('module-1', id));
      }
      for (const pack of overlappingPacks) {
        markPackQuizMastered(pack.id);
        markWordsQuizIntroduced(pack.wordIds);
        masteredPackIds.push(pack.id);
      }
    } else {
      // Attempted but below threshold: badge only (shows the quiz was taken)
      for (const pack of overlappingPacks) {
        markPackQuizBadge(pack.id);
      }
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
