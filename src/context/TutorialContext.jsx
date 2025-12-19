import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
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
 *
 * - firstTime: Auto-starts for new users, full walkthrough with navigation
 * - tour: Manual tutorial (triggered by ? button), no language intro
 * - gameSetup: Triggered when opening game
 * - achievements: Can be triggered manually
 */
const TUTORIALS = {
  firstTime: {
    id: 'firstTime',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Letter River!',
        description: 'Letter River helps you learn letters through an interactive game. First, let\'s set up your languages!',
        icon: '👋',
        targetSelector: '.language-onboarding-card'
      },
      {
        id: 'appLanguage',
        title: 'Choose Your Interface Language',
        description: 'This sets the language for all menus, buttons, and instructions. Pick the language you\'re most comfortable reading.',
        icon: '🌍',
        targetSelector: '.onboarding-app-language-section'
      },
      {
        id: 'practiceLanguage',
        title: 'Choose What to Learn',
        description: 'Select the language you want to practice! This determines which letters you\'ll see in the game.',
        icon: '📖',
        targetSelector: '.onboarding-practice-language-section'
      },
      {
        id: 'confirmLanguages',
        title: 'Ready to Continue!',
        description: 'When you click Continue below, we\'ll show you around the app. You can always change these language settings later in Settings.',
        icon: '✨',
        targetSelector: '.onboarding-continue-button'
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
      // Navigate to Achievements
      {
        id: 'navigateToAchievements',
        title: 'Let\'s Check Achievements!',
        description: 'Let\'s see what badges you can earn. We\'ll navigate to the Achievements page now.',
        icon: '🏆',
        navigateTo: '/achievements'
      },
      {
        id: 'achievementsOverview',
        title: 'Your Badge Collection',
        description: 'Earn badges by completing challenges! Each badge tracks your accomplishments.',
        icon: '🎖️',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'badgeTiers',
        title: 'Badge Tiers',
        description: 'Each badge has Bronze, Silver, and Gold tiers. Complete harder goals to level up and earn more stars!',
        icon: '📊',
        targetSelector: '.badge-tier-example'
      },

      // Navigate to Settings
      {
        id: 'navigateToSettings',
        title: 'Customize Your Experience',
        description: 'Now let\'s visit Settings to see how you can tailor the game to your learning style.',
        icon: '⚙️',
        navigateTo: '/settings'
      },
      {
        id: 'settingsIntro',
        title: 'Settings & Accessibility',
        description: 'Here you can customize how the game works to fit your needs. Everyone learns differently!',
        icon: '🎨'
      },
      {
        id: 'accessibilityOptions',
        title: 'Accessibility Features',
        description: 'Adjust game speed, use dyslexia-friendly fonts, enable click mode instead of dragging, and much more. Try different settings to find what works best for you!',
        icon: '♿',
        targetSelector: '.progress-card-small'
      },

      // Back to home
      {
        id: 'backToHome',
        title: 'Ready to Play?',
        description: 'Great! Now let\'s head back home and start your first game.',
        icon: '🎮',
        navigateTo: '/home'
      },
      {
        id: 'playButton',
        title: 'Start Your First Game',
        description: 'Click the Play button below whenever you\'re ready to practice! We\'ll guide you through the game setup.',
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
        title: 'Quick Tour',
        description: 'Let\'s take a quick tour of Letter River! We\'ll visit each main section.',
        icon: '🗺️'
      },
      {
        id: 'homeFeatures',
        title: 'Home Screen',
        description: 'Track your progress, complete daily quests, and access the game from here.',
        icon: '🏠',
        navigateTo: '/home',
        targetSelector: '.progress-row'
      },
      {
        id: 'tourAchievements',
        title: 'Achievements',
        description: 'View all available badges and track your accomplishments.',
        icon: '🏆',
        navigateTo: '/achievements',
        targetSelector: '.badge-tabs'
      },
      {
        id: 'tourSettings',
        title: 'Settings & Accessibility',
        description: 'Customize game speed, fonts, and accessibility options to match your learning style.',
        icon: '⚙️',
        navigateTo: '/settings',
        targetSelector: '.progress-card-small'
      },
      {
        id: 'tourLearn',
        title: 'Learn',
        description: 'Browse language information and reference materials.',
        icon: '📚',
        navigateTo: '/learn'
      },
      {
        id: 'tourComplete',
        title: 'Tour Complete!',
        description: 'You\'ve seen all the main features. Click the Play button anytime to start practicing!',
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
        title: 'Game Setup',
        description: 'Choose what to practice and set your goal before playing!',
        icon: '⚙️'
      },
      {
        id: 'practiceModes',
        title: 'What to Practice',
        description: 'Select consonants, vowels, or combined letters. You can practice one type or mix them!',
        icon: '📚',
        targetSelector: '.practice-modes'
      },
      {
        id: 'goalSetting',
        title: 'Set Your Goal',
        description: 'Use + and - to set how many letters to practice. Start with 10 if you\'re new, increase as you improve!',
        icon: '🎯',
        targetSelector: '.goal-selector'
      },
      {
        id: 'startGame',
        title: 'Ready? Let\'s Play!',
        description: 'Click Start to begin! Letters will flow across the screen - drag each to its matching box at the bottom.',
        icon: '🚀',
        targetSelector: '.start-game'
      }
    ]
  }
};

export function TutorialProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState(() => {
    return storage.get('hlr.tutorials.completed') || [];
  });
  const [pendingTutorial, setPendingTutorial] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const startTutorial = React.useCallback((tutorialId) => {
    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      console.error(`Tutorial ${tutorialId} not found`);
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
    setPendingTutorial(null);
    setIsNavigating(false);
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
      const nextStep = currentTutorial.steps[nextIndex];

      // If next step requires navigation, navigate first
      if (nextStep.navigateTo && location.pathname !== nextStep.navigateTo) {
        setIsNavigating(true);
        navigate(nextStep.navigateTo);
        // Wait for navigation to complete before advancing
        setTimeout(() => {
          setCurrentStepIndex(nextIndex);
          setIsNavigating(false);
        }, 300);
      } else {
        setCurrentStepIndex(nextIndex);
      }
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
