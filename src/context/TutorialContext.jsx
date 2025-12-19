import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../lib/storage';
import TutorialSpotlight from '../components/TutorialSpotlight.jsx';
import { useLocalization } from './LocalizationContext.jsx';

const TutorialContext = createContext();

// TutorialContext.jsx (top-level in the file)
const normalizePath = (p) => {
  if (!p) return '';
  // Example alias: treat /home as /
  if (p === '/home') return '/';
  // remove trailing slash except root
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
};

const pathsMatch = (a, b) => normalizePath(a) === normalizePath(b);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

/**
 * Tutorial steps definition
 *
 * - firstTime: Auto-starts for new users, full walkthrough with navigation
 * - tour: Manual tutorial (triggered by ? button), no language intro
 * - gameSetup: Triggered when opening game
 * - achievements: Can be triggered manually
 */
const TUTORIAL_DEFINITIONS = {
  firstTime: {
    id: 'firstTime',
    steps: [
      {
        id: 'welcome',
        translationKey: 'tutorials.firstTime.welcome',
        icon: '👋',
        targetSelector: '.language-onboarding-card'
      },
      {
        id: 'appLanguage',
        translationKey: 'tutorials.firstTime.appLanguage',
        icon: '🌍',
        targetSelector: '.onboarding-app-language-section'
      },
      {
        id: 'practiceLanguage',
        translationKey: 'tutorials.firstTime.practiceLanguage',
        icon: '📖',
        targetSelector: '.onboarding-practice-language-section'
      },
      {
        id: 'confirmLanguages',
        translationKey: 'tutorials.firstTime.confirmLanguages',
        icon: '✨',
        targetSelector: '.onboarding-continue-button',
        waitForAction: 'click'
      },
      {
        id: 'navigation',
        translationKey: 'tutorials.firstTime.navigation',
        icon: '🧭',
        targetSelector: '.bottom-nav'
      },
      {
        id: 'progress',
        translationKey: 'tutorials.firstTime.progress',
        icon: '📊',
        targetSelector: '.progress-row'
      },
      {
        id: 'quests',
        translationKey: 'tutorials.firstTime.quests',
        icon: '📅',
        targetSelector: '.quest-card'
      },
      // Navigate to Achievements
      {
        id: 'navigateToAchievements',
        translationKey: 'tutorials.firstTime.navigateToAchievements',
        icon: '🏆',
        navigateTo: '/achievements'
      },
      {
        id: 'achievementsOverview',
        translationKey: 'tutorials.firstTime.achievementsOverview',
        icon: '🎖️',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'badgeTiers',
        translationKey: 'tutorials.firstTime.badgeTiers',
        icon: '📊',
        targetSelector: '.badge-tier-example'
      },

      // Navigate to Settings
      {
        id: 'navigateToSettings',
        translationKey: 'tutorials.firstTime.navigateToSettings',
        icon: '⚙️',
        navigateTo: '/settings'
      },
      {
        id: 'settingsIntro',
        translationKey: 'tutorials.firstTime.settingsIntro',
        icon: '🎨'
      },
      {
        id: 'accessibilityOptions',
        translationKey: 'tutorials.firstTime.accessibilityOptions',
        icon: '♿',
        targetSelector: '.progress-card-small'
      },

      // Back to home
      {
        id: 'backToHome',
        translationKey: 'tutorials.firstTime.backToHome',
        icon: '🎮',
        navigateTo: '/home'
      },
      {
        id: 'playButton',
        translationKey: 'tutorials.firstTime.playButton',
        icon: '▶️',
        targetSelector: '.hero-cta'
      }
    ]
  },

  // Manual tour (triggered by ? button)
  tour: {
    id: 'tour',
    steps: [
      {
        id: 'tourStart',
        translationKey: 'tutorials.tour.tourStart',
        icon: '🗺️'
      },
      {
        id: 'homeFeatures',
        translationKey: 'tutorials.tour.homeFeatures',
        icon: '🏠',
        navigateTo: '/home',
        targetSelector: '.progress-row'
      },
      {
        id: 'tourAchievements',
        translationKey: 'tutorials.tour.tourAchievements',
        icon: '🏆',
        navigateTo: '/achievements',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'tourSettings',
        translationKey: 'tutorials.tour.tourSettings',
        icon: '⚙️',
        navigateTo: '/settings',
        targetSelector: '.progress-card-small'
      },
      {
        id: 'tourLearn',
        translationKey: 'tutorials.tour.tourLearn',
        icon: '📚',
        navigateTo: '/learn'
      },
      {
        id: 'tourComplete',
        translationKey: 'tutorials.tour.tourComplete',
        icon: '✨',
        navigateTo: '/home'
      }
    ]
  },

  // Game setup (triggered when opening game)
  gameSetup: {
    id: 'gameSetup',
    steps: [
      {
        id: 'setupIntro',
        translationKey: 'tutorials.gameSetup.setupIntro',
        icon: '⚙️'
      },
      {
        id: 'practiceModes',
        translationKey: 'tutorials.gameSetup.practiceModes',
        icon: '📚',
        targetSelector: '.practice-modes'
      },
      {
        id: 'goalSetting',
        translationKey: 'tutorials.gameSetup.goalSetting',
        icon: '🎯',
        targetSelector: '.goal-selector'
      },
      {
        id: 'startGame',
        translationKey: 'tutorials.gameSetup.startGame',
        icon: '🚀',
        targetSelector: '.start-game'
      }
    ]
  }
};

export function TutorialProvider({ children }) {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState(() => {
    return storage.get('hlr.tutorials.completed') || [];
  });
  const [pendingTutorial, setPendingTutorial] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingStepIndex, setPendingStepIndex] = useState(null);

  const tutorials = useMemo(() => {
    const translateStep = (step) => ({
      ...step,
      title: t(`${step.translationKey}.title`),
      description: t(`${step.translationKey}.description`)
    });

    return Object.fromEntries(
      Object.entries(TUTORIAL_DEFINITIONS).map(([id, tutorial]) => [
        id,
        { ...tutorial, steps: tutorial.steps.map(translateStep) }
      ])
    );
  }, [t]);

  const startTutorial = React.useCallback((tutorialId) => {
    const tutorial = tutorials[tutorialId];
    if (!tutorial) {
      console.error(`Tutorial ${tutorialId} not found`);
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
    setPendingTutorial(null);
    setIsNavigating(false);
  }, [tutorials]);

  useEffect(() => {
    if (!currentTutorial) return;

    const translated = tutorials[currentTutorial.id];
    if (translated && translated !== currentTutorial) {
      setCurrentTutorial(translated);
    }
  }, [tutorials, currentTutorial]);

  // Check if this is the user's first time
  useEffect(() => {
    const hasSeenFirstTime = completedTutorials.includes('firstTime');
    if (!hasSeenFirstTime && !currentTutorial) {
      // Show first-time tutorial after a short delay
      const timer = setTimeout(() => {
        startTutorial('firstTime');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completedTutorials, currentTutorial, startTutorial]);

  const nextStep = () => {
    if (!currentTutorial) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= currentTutorial.steps.length) {
      completeTutorial();
    } else {
      const nextStep = currentTutorial.steps[nextIndex];

      // If next step requires navigation, navigate first
      if (nextStep.navigateTo && !pathsMatch(location.pathname, nextStep.navigateTo)) {
        setIsNavigating(true);
        setPendingStepIndex(nextIndex);
        navigate(nextStep.navigateTo);
      } else {
        setCurrentStepIndex(nextIndex);
      }
    }
  };

  // Resume tutorial after navigation completes
  useEffect(() => {
    if (!isNavigating || pendingStepIndex === null || !currentTutorial) return;

    const expectedStep = currentTutorial.steps[pendingStepIndex];
    const hasReachedDestination =
+   !expectedStep.navigateTo || pathsMatch(location.pathname, expectedStep.navigateTo);

    if (hasReachedDestination) {
      setCurrentStepIndex(pendingStepIndex);
      setPendingStepIndex(null);
      setIsNavigating(false);
    }
  }, [currentTutorial, isNavigating, location.pathname, pendingStepIndex]);

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    if (!currentTutorial) return;

    const tutorialId = currentTutorial.id;
    const newCompleted = [...completedTutorials, tutorialId];
    setCompletedTutorials(newCompleted);
    storage.set('hlr.tutorials.completed', newCompleted);

    // Set up chained tutorials
    if (tutorialId === 'firstTime' && !newCompleted.includes('gameSetup')) {
      setPendingTutorial('gameSetup');
    }

    setCurrentTutorial(null);
    setCurrentStepIndex(0);
  };

  const resetTutorials = () => {
    setCompletedTutorials([]);
    storage.remove('hlr.tutorials.completed');
  };

  const hasCompletedTutorial = (tutorialId) => {
    return completedTutorials.includes(tutorialId);
  };

  const startPendingTutorial = React.useCallback(() => {
    if (pendingTutorial) {
      startTutorial(pendingTutorial);
    }
  }, [pendingTutorial, startTutorial]);

  const value = {
    currentTutorial,
    currentStep: currentTutorial?.steps[currentStepIndex],
    currentStepIndex,
    totalSteps: currentTutorial?.steps.length || 0,
    isLastStep: currentTutorial ? currentStepIndex === currentTutorial.steps.length - 1 : false,
    isFirstStep: currentStepIndex === 0,
    pendingTutorial,
    isNavigating,
    startTutorial,
    startPendingTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorials,
    hasCompletedTutorial
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {currentTutorial && !isNavigating && (
        <TutorialSpotlight
          step={value.currentStep}
          steps={currentTutorial?.steps}
          tutorialId={currentTutorial?.id}
          isFirst={value.isFirstStep}
          isLast={value.isLastStep}
          onNext={nextStep}
          onBack={previousStep}
          onSkip={skipTutorial}
          stepIndex={currentStepIndex}
          totalSteps={value.totalSteps}
        />
      )}
    </TutorialContext.Provider>
  );
}

TutorialProvider.propTypes = {
  children: PropTypes.node.isRequired
};
