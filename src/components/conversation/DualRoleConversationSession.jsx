import { useState, useCallback, useEffect } from 'react';
import ConversationBriefScreen from './ConversationBriefScreen.jsx';
import ConversationBeatScreen from './ConversationBeatScreen.jsx';
import ConversationRecapScreen from './ConversationRecapScreen.jsx';
import {
  createSession,
  updateSession,
  completeSession,
  savePhraseToSRS
} from '../../lib/conversationProgressStorage.ts';
import {
  expandScriptToSteps,
  getCurrentStep,
  isSessionComplete,
  getSessionStats
} from '../../data/conversation/dualRoleConversation.ts';

/**
 * DualRoleConversationSession
 *
 * Orchestrates dual-role conversation practice where the learner plays both
 * sides of a dialogue (Speaker A and Speaker B). Each turn alternates roles
 * and uses paired Introduce+Reinforce module sequences.
 *
 * Flow:
 * 1. Brief screen (overview)
 * 2. Beat screens (practice each step in expanded script)
 * 3. Recap screen (summary)
 */
export default function DualRoleConversationSession({
  scenario,
  script,
  onExit
}) {
  const [sessionId, setSessionId] = useState(null);
  const [screen, setScreen] = useState('brief');
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [savedLineIds, setSavedLineIds] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState([]);

  // Expand script into steps on mount or when script changes
  useEffect(() => {
    if (script) {
      // Skip reinforce for known lines to keep sessions short
      const steps = expandScriptToSteps(script, true);
      setExpandedSteps(steps);
    }
  }, [script]);

  // Create a practice plan from expanded steps
  const createPlanFromSteps = useCallback((steps) => {
    return {
      scenarioId: scenario.metadata.id,
      beats: steps.map(step => ({
        lineId: step.lineId,
        moduleId: step.moduleId,
        config: {
          ...step.config,
          stepType: step.stepType,
          role: step.role
        }
      })),
      planName: 'dual-role'
    };
  }, [scenario]);

  // Initialize session
  useEffect(() => {
    if (!sessionId && expandedSteps.length > 0) {
      const plan = createPlanFromSteps(expandedSteps);
      const newSessionId = createSession({
        scenarioId: scenario.metadata.id,
        plan,
        currentBeatIndex: 0,
        attemptHistory: [],
        savedLineIds: [],
        startedAt: new Date().toISOString()
      });
      setSessionId(newSessionId);
    }
  }, [sessionId, expandedSteps, scenario, createPlanFromSteps]);

  // Start practice from brief screen
  const handleStart = useCallback(() => {
    setScreen('beat');
    setCurrentBeatIndex(0);
  }, []);

  // Handle beat completion
  const handleBeatComplete = useCallback((attemptResult) => {
    const updatedHistory = [...attemptHistory, attemptResult];
    setAttemptHistory(updatedHistory);

    // Update session in storage
    if (sessionId) {
      updateSession(sessionId, {
        attemptHistory: updatedHistory,
        currentBeatIndex: currentBeatIndex + 1
      });
    }

    // Move to next beat or recap
    const nextIndex = currentBeatIndex + 1;
    if (nextIndex < expandedSteps.length) {
      setCurrentBeatIndex(nextIndex);
    } else {
      // Session complete
      if (sessionId) {
        completeSession(sessionId);
      }
      setScreen('recap');
    }
  }, [attemptHistory, currentBeatIndex, expandedSteps.length, sessionId]);

  // Save phrase to SRS
  const handleSavePhrase = useCallback((lineId) => {
    if (!savedLineIds.includes(lineId)) {
      const updatedSaved = [...savedLineIds, lineId];
      setSavedLineIds(updatedSaved);

      if (sessionId) {
        savePhraseToSRS(scenario.metadata.id, lineId, sessionId);
      }
    }
  }, [savedLineIds, sessionId, scenario.metadata.id]);

  // Practice again
  const handlePracticeAgain = useCallback(() => {
    setScreen('brief');
    setCurrentBeatIndex(0);
    setAttemptHistory([]);
    setSavedLineIds([]);
    setSessionId(null);
  }, []);

  // Review saved phrases
  const handleReviewSaved = useCallback(() => {
    console.log('Review saved phrases:', savedLineIds);
    onExit();
  }, [savedLineIds, onExit]);

  // Go back to brief from beat screen
  const handleBackToBrief = useCallback(() => {
    setScreen('brief');
  }, []);

  // Check if steps are ready
  if (expandedSteps.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-slate-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Render brief screen
  if (screen === 'brief') {
    // Create a modified scenario object for the brief screen
    const briefScenario = {
      ...scenario,
      metadata: {
        ...scenario.metadata,
        lineCount: script.turns.length,
        titleKey: script.title,
        subtitleKey: script.description
      },
      defaultPlan: createPlanFromSteps(expandedSteps)
    };

    return (
      <ConversationBriefScreen
        scenario={briefScenario}
        onStart={handleStart}
        onBack={onExit}
      />
    );
  }

  // Render beat screen
  if (screen === 'beat') {
    const currentStep = getCurrentStep(expandedSteps, currentBeatIndex);

    if (!currentStep) {
      setScreen('recap');
      return null;
    }

    // Convert step to beat format
    const currentBeat = {
      lineId: currentStep.lineId,
      moduleId: currentStep.moduleId,
      config: currentStep.config
    };

    return (
      <ConversationBeatScreen
        scenario={scenario}
        beat={currentBeat}
        beatIndex={currentBeatIndex}
        totalBeats={expandedSteps.length}
        attemptHistory={attemptHistory}
        onBeatComplete={handleBeatComplete}
        onSavePhrase={handleSavePhrase}
        onExit={handleBackToBrief}
      />
    );
  }

  // Render recap screen
  if (screen === 'recap') {
    return (
      <ConversationRecapScreen
        scenario={scenario}
        attemptHistory={attemptHistory}
        savedLineIds={savedLineIds}
        onFinish={onExit}
        onPracticeAgain={handlePracticeAgain}
        onReviewSaved={handleReviewSaved}
      />
    );
  }

  return null;
}
