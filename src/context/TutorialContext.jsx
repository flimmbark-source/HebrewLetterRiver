import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../lib/storage';

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
        description: 'Learn letters by catching them as they flow down the river. Let\'s get started!',
        icon: '👋'
      },
      {
        id: 'gameplay',
        title: 'How to Play',
        description: 'Letters will flow down the screen. Tap or click the correct letter button at the bottom to catch them!',
        icon: '🎮'
      },
      {
        id: 'stars',
        title: 'Earn Stars',
        description: 'Each correct catch earns you stars. Stars unlock new levels and badges!',
        icon: '⭐'
      },
      {
        id: 'daily',
        title: 'Daily Quests',
        description: 'Complete daily quests for bonus stars and build your streak!',
        icon: '📅'
      },
      {
        id: 'badges',
        title: 'Collect Badges',
        description: 'Earn badges for achievements like perfect games, speed runs, and consistent practice!',
        icon: '🏆'
      }
    ]
  },
  gameSetup: {
    id: 'gameSetup',
    steps: [
      {
        id: 'modes',
        title: 'Practice Modes',
        description: 'Choose what you want to practice: consonants, vowels, or combined letters.',
        icon: '📚'
      },
      {
        id: 'goal',
        title: 'Set Your Goal',
        description: 'Pick how many letters you want to practice. Start small and work your way up!',
        icon: '🎯'
      }
    ]
  },
  achievements: {
    id: 'achievements',
    steps: [
      {
        id: 'badgeTypes',
        title: 'Badge Categories',
        description: 'Badges are organized by category: Classic achievements, Polyglot progress, and Special events.',
        icon: '🎖️'
      },
      {
        id: 'tiers',
        title: 'Badge Tiers',
        description: 'Each badge has multiple tiers (Bronze, Silver, Gold). Complete higher tiers for more stars!',
        icon: '📊'
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
      {currentTutorial && <TutorialOverlay />}
    </TutorialContext.Provider>
  );
}

TutorialProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Tutorial Overlay Component
 */
function TutorialOverlay() {
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    isFirstStep,
    nextStep,
    previousStep,
    skipTutorial
  } = useTutorial();

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-center">
          <div className="text-6xl mb-3">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-300 text-center text-lg leading-relaxed mb-6">
            {currentStep.description}
          </p>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStepIndex
                    ? 'w-8 bg-cyan-500'
                    : index < currentStepIndex
                    ? 'w-2 bg-cyan-700'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={previousStep}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={nextStep}
              className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
            >
              {isLastStep ? 'Get Started!' : 'Next'}
            </button>
          </div>

          {/* Skip button */}
          <button
            onClick={skipTutorial}
            className="w-full mt-3 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
