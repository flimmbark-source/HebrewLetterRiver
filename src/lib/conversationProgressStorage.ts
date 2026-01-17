/**
 * Conversation Progress Storage
 *
 * Manages persistence of conversation practice progress, beat attempts,
 * and line-level results for spaced repetition.
 */

import type {
  ConversationProgressEntry,
  ConversationAttemptResult,
  ConversationSessionState
} from '../data/conversation/types.ts';

const PROGRESS_KEY = 'conversationProgress';
const SESSIONS_KEY = 'conversationSessions';

/**
 * Progress state structure: scenarioId -> ConversationProgressEntry
 */
interface ProgressState {
  [scenarioId: string]: ConversationProgressEntry;
}

/**
 * Sessions state structure: sessionId -> ConversationSessionState
 */
interface SessionsState {
  [sessionId: string]: ConversationSessionState;
}

/**
 * Load progress state from localStorage
 */
function loadProgressState(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ProgressState;
  } catch (err) {
    console.warn('[conversationProgressStorage] Failed to parse progress', err);
    return {};
  }
}

/**
 * Save progress state to localStorage
 */
function saveProgressState(state: ProgressState) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[conversationProgressStorage] Failed to save progress', err);
  }
}

/**
 * Load sessions state from localStorage
 */
function loadSessionsState(): SessionsState {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as SessionsState;
  } catch (err) {
    console.warn('[conversationProgressStorage] Failed to parse sessions', err);
    return {};
  }
}

/**
 * Save sessions state to localStorage
 */
function saveSessionsState(state: SessionsState) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[conversationProgressStorage] Failed to save sessions', err);
  }
}

/**
 * Record a beat attempt result
 */
export function recordBeatAttempt(
  scenarioId: string,
  lineId: string,
  attemptResult: ConversationAttemptResult
) {
  const state = loadProgressState();
  const now = new Date().toISOString();

  // Initialize scenario entry if it doesn't exist
  if (!state[scenarioId]) {
    state[scenarioId] = {
      scenarioId,
      lineProgress: {},
      totalBeatsCompleted: 0,
      lastSessionAt: now
    };
  }

  const scenarioEntry = state[scenarioId];

  // Initialize line progress if it doesn't exist
  if (!scenarioEntry.lineProgress[lineId]) {
    scenarioEntry.lineProgress[lineId] = {
      attempts: 0,
      lastResult: attemptResult.resultType,
      lastAttemptAt: now
    };
  }

  // Update line progress
  const lineProgress = scenarioEntry.lineProgress[lineId];
  lineProgress.attempts += 1;
  lineProgress.lastResult = attemptResult.resultType;
  lineProgress.lastAttemptAt = now;

  // Update scenario-level stats
  scenarioEntry.totalBeatsCompleted += 1;
  scenarioEntry.lastSessionAt = now;

  saveProgressState(state);
}

/**
 * Get progress for a specific scenario
 */
export function getScenarioProgress(scenarioId: string): ConversationProgressEntry | null {
  const state = loadProgressState();
  return state[scenarioId] ?? null;
}

/**
 * Get progress for a specific line within a scenario
 */
export function getLineProgress(scenarioId: string, lineId: string) {
  const state = loadProgressState();
  return state[scenarioId]?.lineProgress[lineId] ?? null;
}

/**
 * Get scenario statistics
 */
export function getScenarioStats(scenarioId: string, totalLines: number) {
  const state = loadProgressState();
  const entry = state[scenarioId];

  if (!entry) {
    return {
      practicedLines: 0,
      totalLines,
      correctLines: 0,
      completionRate: 0,
      totalBeatsCompleted: 0
    };
  }

  const practicedLines = Object.keys(entry.lineProgress).length;
  const correctLines = Object.values(entry.lineProgress).filter(
    lp => lp.lastResult === 'correct'
  ).length;

  return {
    practicedLines,
    totalLines,
    correctLines,
    completionRate: totalLines > 0 ? practicedLines / totalLines : 0,
    totalBeatsCompleted: entry.totalBeatsCompleted
  };
}

/**
 * Get all conversation progress
 */
export function getAllConversationProgress(): ProgressState {
  return loadProgressState();
}

/**
 * Clear all conversation progress (for testing or reset)
 */
export function clearAllConversationProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error('Error clearing conversation progress:', error);
  }
}

/**
 * Create a new conversation session
 */
export function createSession(sessionState: ConversationSessionState): string {
  const sessions = loadSessionsState();
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  sessions[sessionId] = sessionState;
  saveSessionsState(sessions);

  return sessionId;
}

/**
 * Update an existing session
 */
export function updateSession(sessionId: string, updates: Partial<ConversationSessionState>) {
  const sessions = loadSessionsState();
  const existingSession = sessions[sessionId];

  if (!existingSession) {
    console.warn(`[conversationProgressStorage] Session ${sessionId} not found`);
    return;
  }

  sessions[sessionId] = {
    ...existingSession,
    ...updates
  };

  saveSessionsState(sessions);
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): ConversationSessionState | null {
  const sessions = loadSessionsState();
  return sessions[sessionId] ?? null;
}

/**
 * Get all sessions for a scenario
 */
export function getSessionsForScenario(scenarioId: string): ConversationSessionState[] {
  const sessions = loadSessionsState();
  return Object.values(sessions).filter(s => s.scenarioId === scenarioId);
}

/**
 * Complete a session and record all attempts
 */
export function completeSession(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) {
    console.warn(`[conversationProgressStorage] Session ${sessionId} not found`);
    return;
  }

  // Mark session as completed
  updateSession(sessionId, {
    completedAt: new Date().toISOString()
  });

  // Record all attempts in the progress state
  session.attemptHistory.forEach(attempt => {
    recordBeatAttempt(session.scenarioId, attempt.beat.lineId, attempt);
  });
}

/**
 * Save phrase to SRS deck (integrates with existing reading results)
 */
export function savePhraseToSRS(
  scenarioId: string,
  lineId: string,
  sessionId: string
) {
  // This will be integrated with the existing SRS system
  // For now, just track which lines have been saved
  const session = getSession(sessionId);
  if (!session) return;

  if (!session.savedLineIds.includes(lineId)) {
    updateSession(sessionId, {
      savedLineIds: [...session.savedLineIds, lineId]
    });
  }
}
