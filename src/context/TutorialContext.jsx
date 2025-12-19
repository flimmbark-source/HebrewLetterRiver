import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../lib/storage';
import TutorialSpotlight from '../components/TutorialSpotlight.jsx';

const TutorialContext = createContext();

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

/**
 * Tutorial steps definition
 */
const TUTORIALS = {
  firstTime: {
    id: 'firstTime',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Letter River!',
        description: 'Letter River helps you learn letters through an interactive game. Let\'s take a quick tour!',
        icon: '👋'
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Use the bottom navigation to explore. Home shows your progress, Learn shows language info, Achievements shows badges, and Settings lets you customize.',
        icon: '🧭',
        targetSelector: '.bottom-nav'
      },
      {
        id: 'progress',
        title: 'Your Progress',
        description: 'Here you can track your streak, level, and latest badge. Each game you play earns stars to level up!',
        icon: '📊',
        targetSelector: '.progress-row'
      },
      {
        id: 'quests',
        title: 'Daily Quests',
        description: 'Complete daily quests to earn bonus stars. Quests reset every day at midnight Jerusalem time.',
        icon: '📅',
        targetSelector: '.quest-card'
      },
      {
        id: 'playCTA',
        title: 'Ready to Play?',
        description: 'Click the Play button below to start catching letters! We\'ll guide you through the game setup next.',
        icon: '🎮',
        targetSelector: '.hero-cta',
        waitForAction: 'click'
      }
    ]
  },
  gameSetup: {
    id: 'gameSetup',
    steps: [
      {
        id: 'welcome',
        title: 'Game Setup',
        description: 'Before playing, you can choose what to practice and set your goal. Let\'s go through the options.',
        icon: '⚙️'
      },
      {
        id: 'modes',
        title: 'Choose What to Practice',
        description: 'Select which letters you want to practice. You can choose consonants, vowels, or combined letters. Click one to select it.',
        icon: '📚',
        targetSelector: '.practice-modes'
      },
      {
        id: 'goal',
        title: 'Set Your Goal',
        description: 'Use the + and - buttons to adjust how many letters you want to reach. Start with a low number like 10 if you\'re just beginning!',
        icon: '🎯',
        targetSelector: '.goal-selector'
      },
      {
        id: 'start',
        title: 'Start the Game!',
        description: 'When you\'re ready, click the Start button. Letters will flow down the screen - drag each one to the correct box at the bottom!',
        icon: '🚀',
        targetSelector: '.start-game',
        waitForAction: 'click'
      }
    ]
  },
  achievements: {
    id: 'achievements',
    steps: [
      {
        id: 'overview',
        title: 'Achievements',
        description: 'Track all your accomplishments here! Badges are earned by completing specific challenges.',
        icon: '🏆'
      },
      {
        id: 'categories',
        title: 'Badge Categories',
        description: 'Badges are organized by type: Classic (perfect games, streaks), Polyglot (multi-language progress), and Special events (seasonal challenges).',
        icon: '🎖️',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'tiers',
        title: 'Badge Tiers',
        description: 'Each badge has multiple tiers shown by Bronze, Silver, and Gold levels. Complete harder challenges to reach higher tiers and earn more stars!',
        icon: '📊',
        targetSelector: '.badge-tier-example'
      }
    ]
  }
};

export function TutorialProvider({ children }) {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState(() => {
    return storage.get('hlr.tutorials.completed') || [];
  });
  const [pendingTutorial, setPendingTutorial] = useState(null);

  const startTutorial = React.useCallback((tutorialId) => {
    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      console.error(`Tutorial ${tutorialId} not found`);
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
    setPendingTutorial(null);
  }, []);

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
      setCurrentStepIndex(nextIndex);
    }
  };

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
      {currentTutorial && (
        <TutorialSpotlight
          step={value.currentStep}
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
