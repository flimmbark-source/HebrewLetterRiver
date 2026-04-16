import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import OnboardingGoalScreen from './OnboardingGoalScreen.jsx';
import SkillCheckScreen from './SkillCheckScreen.jsx';
import WhyLetterRiverScreen from './WhyLetterRiverScreen.jsx';
import GuidedFirstSession from './GuidedFirstSession.jsx';
import FirstSessionSuccess from './FirstSessionSuccess.jsx';
import { bridgeBuilderWords } from '../data/bridgeBuilderWords.js';
import { allSentences } from '../data/sentences/index.ts';
import { learningModules } from '../data/modules/index.ts';
import {
  markVocabSectionPracticed,
  syncSentenceCompletion,
  initializeModuleProgress,
  getModuleProgress,
} from '../lib/moduleProgressStorage.ts';

/**
 * OnboardingFlow orchestrates the full onboarding experience.
 *
 * State machine:
 *   idle -> goal -> skillCheck (if familiar/returning) -> whyScreen -> guidedSession -> success -> complete
 *
 * The component is rendered when hasSelectedLanguage && !onboarding.completed.
 */

const STEPS = {
  IDLE: 'idle',
  GOAL: 'goal',
  SKILL_CHECK: 'skillCheck',
  WHY_SCREEN: 'whyScreen',
  GUIDED_SESSION: 'guidedSession',
  SUCCESS: 'success',
  COMPLETE: 'complete'
};

/**
 * Map an onboarding goal to the question types shown in the skill check.
 *   'familiar'  → letters + vocab  (knows some letters, testing word recognition)
 *   'returning' → letters + vocab + sentences  (daily practice, richer test)
 */
function getQuestionTypesForGoal(goal) {
  if (goal === 'returning') return ['letter', 'vocab', 'sentence'];
  if (goal === 'familiar') return ['letter', 'vocab'];
  return ['letter'];
}

/**
 * Apply mastery to module progress based on the quiz breakdown.
 * Called after the skill-check completes when the player has a breakdown.
 *
 * Thresholds:
 *   vocab    ≥ 60% correct → mark all vocab sections in module-1 as practiced
 *   sentence ≥ 60% correct → sync sentence completion for module-1 proportionally
 */
function applyQuizMastery(breakdown) {
  if (!breakdown) return;

  const module1 = learningModules.find((m) => m.id === 'module-1');
  if (!module1) return;

  // Ensure module-1 is initialised before we write to it
  let existing = getModuleProgress('module-1');
  if (!existing) {
    initializeModuleProgress(
      'module-1',
      module1.sentenceIds.length,
      module1.vocabTextIds.length
    );
  }

  // --- Vocab mastery ---
  const vocabBreakdown = breakdown.vocab;
  if (vocabBreakdown && vocabBreakdown.total > 0) {
    const accuracy = vocabBreakdown.correct / vocabBreakdown.total;
    if (accuracy >= 0.6) {
      module1.vocabTextIds.forEach((vocabTextId) =>
        markVocabSectionPracticed('module-1', vocabTextId)
      );
    }
  }

  // --- Sentence mastery ---
  const sentenceBreakdown = breakdown.sentence;
  if (sentenceBreakdown && sentenceBreakdown.total > 0) {
    const accuracy = sentenceBreakdown.correct / sentenceBreakdown.total;
    if (accuracy >= 0.6) {
      // Credit sentences proportionally to accuracy (rounded down, min 1)
      const sentencesEarned = Math.max(
        1,
        Math.floor(accuracy * module1.sentenceIds.length)
      );
      syncSentenceCompletion('module-1', sentencesEarned);
    }
  }
}

export default function OnboardingFlow() {
  const { hasSelectedLanguage } = useLanguage();
  const [step, setStep] = useState(STEPS.IDLE);
  const [goal, setGoal] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Check if onboarding is already completed
  const onboardingCompleted = loadState('onboarding.completed', false);

  // Derive question types from goal
  const questionTypes = useMemo(() => getQuestionTypesForGoal(goal), [goal]);

  // Filter vocab words: use greetings + basics (difficulty 1-2) for a beginner-friendly quiz
  const quizVocabWords = useMemo(
    () => bridgeBuilderWords.filter((w) => w.difficulty <= 2),
    []
  );

  // Filter sentences: use difficulty-1 sentences from the first module theme
  const quizSentences = useMemo(
    () => allSentences.filter((s) => s.difficulty === 1),
    []
  );

  // Start the flow when language is selected and onboarding isn't done
  useEffect(() => {
    if (hasSelectedLanguage && !onboardingCompleted && step === STEPS.IDLE) {
      // Check if we have a saved goal already (e.g., user refreshed mid-flow)
      const savedGoal = loadState('onboarding.goal', null);
      if (savedGoal) {
        // Resume — but if everything else is done, just mark complete
        const firstSessionComplete = loadState('onboarding.firstSessionComplete', false);
        if (firstSessionComplete) {
          saveState('onboarding.completed', true);
          setStep(STEPS.COMPLETE);
          return;
        }
        setGoal(savedGoal);
      }
      // Show goal screen (user can re-pick even if they previously selected)
      setStep(STEPS.GOAL);
    }
  }, [hasSelectedLanguage, onboardingCompleted, step]);

  const handleGoalSelect = useCallback((selectedGoal) => {
    setGoal(selectedGoal);
    saveState('onboarding.goal', selectedGoal);
    saveState('onboarding.completed', false);

    if (selectedGoal === 'beginner') {
      // Beginners skip skill check
      saveState('onboarding.skillLevel', 'beginner');
      setSkillLevel('beginner');
      // Check if why screen was dismissed before
      const whyDismissed = loadState('onboarding.whyScreenDismissed', false);
      if (whyDismissed) {
        setStep(STEPS.GUIDED_SESSION);
      } else {
        setStep(STEPS.WHY_SCREEN);
      }
    } else {
      // familiar or returning — show skill check
      setStep(STEPS.SKILL_CHECK);
    }
  }, []);

  const handleSkillCheckComplete = useCallback(
    ({ score, total, skillLevel: level, breakdown }) => {
      setSkillLevel(level);
      saveState('onboarding.skillLevel', level);
      saveState('onboarding.skillCheckScore', score);

      // Apply mastery unlocks based on quiz performance
      applyQuizMastery(breakdown);

      if (level === 'advanced') {
        // Advanced users skip guided session
        saveState('onboarding.completed', true);
        setStep(STEPS.COMPLETE);
      } else {
        // beginner or intermediate — show why screen then guided session
        const whyDismissed = loadState('onboarding.whyScreenDismissed', false);
        if (whyDismissed) {
          setStep(STEPS.GUIDED_SESSION);
        } else {
          setStep(STEPS.WHY_SCREEN);
        }
      }
    },
    []
  );

  const handleSkillCheckSkip = useCallback(() => {
    // Default to goal-based routing
    if (goal === 'returning') {
      saveState('onboarding.skillLevel', 'intermediate');
      setSkillLevel('intermediate');
    } else {
      saveState('onboarding.skillLevel', 'beginner');
      setSkillLevel('beginner');
    }

    const whyDismissed = loadState('onboarding.whyScreenDismissed', false);
    if (whyDismissed) {
      setStep(STEPS.GUIDED_SESSION);
    } else {
      setStep(STEPS.WHY_SCREEN);
    }
  }, [goal]);

  const handleWhyContinue = useCallback(() => {
    setStep(STEPS.GUIDED_SESSION);
  }, []);

  const handleGuidedSessionComplete = useCallback((payload) => {
    setSessionData(payload);
    if (payload) {
      setStep(STEPS.SUCCESS);
    } else {
      // User closed game manually without completing — still mark onboarding done
      saveState('onboarding.completed', true);
      setStep(STEPS.COMPLETE);
    }
  }, []);

  const handleSuccessContinue = useCallback(() => {
    saveState('onboarding.completed', true);
    setStep(STEPS.COMPLETE);
  }, []);

  // Don't render anything if onboarding is done or not started
  if (!hasSelectedLanguage || onboardingCompleted || step === STEPS.IDLE || step === STEPS.COMPLETE) {
    return null;
  }

  switch (step) {
    case STEPS.GOAL:
      return <OnboardingGoalScreen onSelect={handleGoalSelect} />;

    case STEPS.SKILL_CHECK:
      return (
        <SkillCheckScreen
          onComplete={handleSkillCheckComplete}
          onSkip={handleSkillCheckSkip}
          questionTypes={questionTypes}
          vocabWords={quizVocabWords}
          sentences={quizSentences}
        />
      );

    case STEPS.WHY_SCREEN:
      return <WhyLetterRiverScreen onContinue={handleWhyContinue} />;

    case STEPS.GUIDED_SESSION:
      return <GuidedFirstSession onComplete={handleGuidedSessionComplete} />;

    case STEPS.SUCCESS:
      return (
        <FirstSessionSuccess
          lettersLearned={sessionData?.uniqueLetters ?? 0}
          starsEarned={sessionData?.stars ?? 0}
          onContinue={handleSuccessContinue}
        />
      );

    default:
      return null;
  }
}
