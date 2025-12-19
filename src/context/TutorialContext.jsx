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
        description: 'Start by picking the interface language and the language you want to practice. You can change these any time in Settings.',
        icon: '👋',
        targetSelector: '.language-selector-popup, .bottom-nav'
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Use the navigation bar to explore. \'Home\' shows your progress, \'Play\' launches the game, \'Achievements\' shows your badges, and \'Settings\' lets you customise your experience.',
        icon: '🧭',
        targetSelector: '.bottom-nav'
      },
      {
        id: 'playCTA',
        title: 'Start Playing',
        description: 'Ready to practise? Tap here to play the game. You\'ll catch letters as they float down the river.',
        icon: '🎮',
        targetSelector: '.hero-cta'
      },
      {
        id: 'progress',
        title: 'Track Your Progress',
        description: 'Track your streak, level and badges here. Completing games and quests earns you stars and unlocks badges.',
        icon: '📊',
        targetSelector: '.progress-row'
      },
      {
        id: 'daily',
        title: 'Daily Quests',
        description: 'Daily quests give you extra rewards. Complete tasks, claim stars and level up!',
        icon: '📅',
        targetSelector: '.quest-card'
      }
    ]
  },
  gameSetup: {
    id: 'gameSetup',
    steps: [
      {
        id: 'modes',
        title: 'Practice Modes',
        description: 'Choose what you want to practise: consonants, vowels or both.',
        icon: '📚',
        targetSelector: '.practice-modes'
      },
      {
        id: 'goal',
        title: 'Set Your Goal',
        description: 'Set how many letters you want to practise in this session. Start small and increase as you improve.',
        icon: '🎯',
        targetSelector: '.goal-selector'
      },
      {
        id: 'start',
        title: 'Start Game',
        description: 'Tap here to start catching letters. Drag each falling letter into the matching bucket.',
        icon: '🚀',
        targetSelector: '.start-game'
      }
    ]
  },
  achievements: {
    id: 'achievements',
    steps: [
      {
        id: 'badgeTypes',
        title: 'Badge Categories',
        description: 'Badges are organised by category. Classic badges reward perfect games and streaks; Polyglot badges mark your progress across different languages; Special event badges celebrate holidays or challenges.',
        icon: '🎖️',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'tiers',
        title: 'Badge Tiers',
        description: 'Each badge has multiple tiers. Earn more stars or complete tougher challenges to reach higher tiers and unlock more rewards.',
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

  const startTutorial = React.useCallback((tutorialId) => {
    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      console.error(`Tutorial ${tutorialId} not found`);
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
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

    const newCompleted = [...completedTutorials, currentTutorial.id];
    setCompletedTutorials(newCompleted);
    storage.set('hlr.tutorials.completed', newCompleted);

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

  const value = {
    currentTutorial,
    currentStep: currentTutorial?.steps[currentStepIndex],
    currentStepIndex,
    totalSteps: currentTutorial?.steps.length || 0,
    isLastStep: currentTutorial ? currentStepIndex === currentTutorial.steps.length - 1 : false,
    isFirstStep: currentStepIndex === 0,
    startTutorial,
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
