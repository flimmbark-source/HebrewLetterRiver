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

/**
 * ConversationSession
 *
 * Orchestrates the conversation practice flow:
 * 1. Brief screen (overview)
 * 2. Beat screens (practice each beat)
 * 3. Recap screen (summary)
 */
export default function ConversationSession({ scenario, onExit }) {
  const [sessionId, setSessionId] = useState(null);
  const [screen, setScreen] = useState('brief'); // 'brief' | 'beat' | 'recap'
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [savedLineIds, setSavedLineIds] = useState([]);
  const [activePlan, setActivePlan] = useState(scenario.defaultPlan);

  // Initialize session
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = createSession({
        scenarioId: scenario.metadata.id,
        plan: activePlan,
        currentBeatIndex: 0,
        attemptHistory: [],
        savedLineIds: [],
        startedAt: new Date().toISOString()
      });
      setSessionId(newSessionId);
    }
  }, [sessionId, scenario, activePlan]);

  // Start practice from brief screen (default plan)
  const handleStart = useCallback(() => {
    setActivePlan(scenario.defaultPlan);
    setScreen('beat');
    setCurrentBeatIndex(0);
  }, [scenario.defaultPlan]);

  // Start practice from a specific segment
  const handleStartSegment = useCallback((segment) => {
    setActivePlan(segment.plan);
    setSessionId(null); // Reset session to use new plan
    setScreen('beat');
    setCurrentBeatIndex(0);
    setAttemptHistory([]);
    setSavedLineIds([]);
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
    if (nextIndex < activePlan.beats.length) {
      setCurrentBeatIndex(nextIndex);
    } else {
      // Session complete
      if (sessionId) {
        completeSession(sessionId);
      }
      setScreen('recap');
    }
  }, [attemptHistory, currentBeatIndex, activePlan.beats.length, sessionId]);

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
    // Reset state and start over
    setScreen('brief');
    setCurrentBeatIndex(0);
    setAttemptHistory([]);
    setSavedLineIds([]);
    setActivePlan(scenario.defaultPlan); // Reset to default plan
    setSessionId(null); // Will create new session
  }, [scenario.defaultPlan]);

  // Review saved phrases
  const handleReviewSaved = useCallback(() => {
    // TODO: Integrate with existing SRS review system
    console.log('Review saved phrases:', savedLineIds);
    onExit();
  }, [savedLineIds, onExit]);

  // Go back to brief from beat screen
  const handleBackToBrief = useCallback(() => {
    setScreen('brief');
  }, []);

  // Render current screen
  if (screen === 'brief') {
    return (
      <ConversationBriefScreen
        scenario={scenario}
        onStart={handleStart}
        onStartSegment={handleStartSegment}
        onBack={onExit}
      />
    );
  }

  if (screen === 'beat') {
    const currentBeat = activePlan.beats[currentBeatIndex];
    if (!currentBeat) {
      // Safety: if beat not found, go to recap
      setScreen('recap');
      return null;
    }

    return (
      <ConversationBeatScreen
        scenario={scenario}
        beat={currentBeat}
        beatIndex={currentBeatIndex}
        totalBeats={activePlan.beats.length}
        attemptHistory={attemptHistory}
        onBeatComplete={handleBeatComplete}
        onSavePhrase={handleSavePhrase}
        onExit={handleBackToBrief}
      />
    );
  }

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
