import { useState, useCallback, useEffect, useMemo } from 'react';
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
  generateDualRoleScript
} from '../../data/conversation/dualRoleConversation.ts';
import { generateSegmentsFromSentences } from '../../data/conversation/scenarioFactory.ts';

/**
 * DualRoleConversationSession
 *
 * Orchestrates dual-role conversation practice where the learner plays both
 * sides of a dialogue (Speaker A and Speaker B). Each turn alternates roles
 * and uses paired Introduce+Reinforce module sequences.
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
  const [activeSteps, setActiveSteps] = useState([]);

  useEffect(() => {
    if (script) {
      const steps = expandScriptToSteps(script, true);
      setExpandedSteps(steps);
    }
  }, [script]);

  useEffect(() => {
    setActiveSteps(expandedSteps);
  }, [expandedSteps]);

  const scriptSegments = useMemo(() => {
    if (!script || expandedSteps.length === 0) {
      return undefined;
    }

    const lineMap = new Map(scenario.lines.map(line => [line.id, line]));
    const scriptLineIds = script.turns.map(turn => turn.lineId);
    const scriptLines = scriptLineIds
      .map(lineId => lineMap.get(lineId))
      .filter(Boolean);
    const scriptSentences = scriptLines
      .map(line => line.sentenceData)
      .filter(Boolean);

    return generateSegmentsFromSentences(
      scenario.metadata.id,
      scriptSentences,
      scriptLines
    );
  }, [expandedSteps.length, script, scenario.lines, scenario.metadata.id]);

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

  useEffect(() => {
    if (!sessionId && activeSteps.length > 0) {
      const plan = createPlanFromSteps(activeSteps);
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
  }, [sessionId, activeSteps, scenario, createPlanFromSteps]);

  const resetToBeatScreen = useCallback((steps) => {
    setActiveSteps(steps);
    setSessionId(null);
    setScreen('beat');
    setCurrentBeatIndex(0);
    setAttemptHistory([]);
    setSavedLineIds([]);
  }, []);

  const handleStart = useCallback(() => {
    resetToBeatScreen(expandedSteps);
  }, [expandedSteps, resetToBeatScreen]);

  const buildStepsForSegments = useCallback((selectedSegments) => {
    const segmentsToUse = Array.isArray(selectedSegments)
      ? selectedSegments
      : [selectedSegments];
    const lineMap = new Map(scenario.lines.map(line => [line.id, line]));
    const seenLineIds = new Set();
    const segmentLineIds = segmentsToUse.flatMap(segment => segment?.pairs?.flatMap(pair => [
      pair.shortSentenceId,
      pair.longSentenceId
    ]) || []);
    const segmentSentences = segmentLineIds
      .filter(lineId => {
        if (!lineId || seenLineIds.has(lineId)) return false;
        seenLineIds.add(lineId);
        return true;
      })
      .map(lineId => lineMap.get(lineId)?.sentenceData)
      .filter(Boolean);

    if (segmentSentences.length === 0) {
      return expandedSteps;
    }

    const segmentScript = generateDualRoleScript(
      segmentSentences,
      `${segmentsToUse[0]?.id || 'route-stop'}-dual`,
      scenario.metadata.theme,
      `Practice ${scenario.metadata.theme.toLowerCase()} in dual-role mode`,
      scenario.metadata.id
    );

    return expandScriptToSteps(segmentScript, true);
  }, [expandedSteps, scenario.lines, scenario.metadata.id, scenario.metadata.theme]);

  const handleStartSegment = useCallback((segmentOrRouteStop) => {
    const selectedSegments = Array.isArray(segmentOrRouteStop?.segments)
      ? segmentOrRouteStop.segments
      : [segmentOrRouteStop];
    const segmentSteps = buildStepsForSegments(selectedSegments);
    resetToBeatScreen(segmentSteps);
  }, [buildStepsForSegments, resetToBeatScreen]);

  const handleBeatComplete = useCallback((attemptResult) => {
    const updatedHistory = [...attemptHistory, attemptResult];
    setAttemptHistory(updatedHistory);

    if (sessionId) {
      updateSession(sessionId, {
        attemptHistory: updatedHistory,
        currentBeatIndex: currentBeatIndex + 1
      });
    }

    const nextIndex = currentBeatIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentBeatIndex(nextIndex);
    } else {
      if (sessionId) {
        completeSession(sessionId);
      }
      setScreen('recap');
    }
  }, [attemptHistory, currentBeatIndex, activeSteps.length, sessionId]);

  const handleSavePhrase = useCallback((lineId) => {
    if (!savedLineIds.includes(lineId)) {
      const updatedSaved = [...savedLineIds, lineId];
      setSavedLineIds(updatedSaved);

      if (sessionId) {
        savePhraseToSRS(scenario.metadata.id, lineId, sessionId);
      }
    }
  }, [savedLineIds, sessionId, scenario.metadata.id]);

  const handlePracticeAgain = useCallback(() => {
    setScreen('brief');
    setCurrentBeatIndex(0);
    setAttemptHistory([]);
    setSavedLineIds([]);
    setActiveSteps(expandedSteps);
    setSessionId(null);
  }, [expandedSteps]);

  const handleReviewSaved = useCallback(() => {
    console.log('Review saved phrases:', savedLineIds);
    onExit();
  }, [savedLineIds, onExit]);

  const handleBackToBrief = useCallback(() => {
    setScreen('brief');
    setActiveSteps(expandedSteps);
  }, [expandedSteps]);

  if (expandedSteps.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf4e4] text-[#173d2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⌛</div>
          <p className="text-lg text-[#4e665b]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (screen === 'brief') {
    const routeSegments = scenario.segments?.length
      ? scenario.segments
      : scriptSegments;
    const briefScenario = {
      ...scenario,
      metadata: {
        ...scenario.metadata,
        lineCount: script.turns.length,
        titleKey: script.title,
        subtitleKey: script.description
      },
      defaultPlan: createPlanFromSteps(expandedSteps),
      segments: routeSegments
    };

    return (
      <ConversationBriefScreen
        scenario={briefScenario}
        onStart={handleStart}
        onStartSegment={handleStartSegment}
        onBack={onExit}
      />
    );
  }

  if (screen === 'beat') {
    const currentStep = getCurrentStep(activeSteps, currentBeatIndex);

    if (!currentStep) {
      setScreen('recap');
      return null;
    }

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
        totalBeats={activeSteps.length}
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
