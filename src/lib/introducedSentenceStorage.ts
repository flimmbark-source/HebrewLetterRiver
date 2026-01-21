/**
 * Storage for tracking which sentences have been "introduced" via the word-match pop-up.
 * Once a sentence is introduced, the pop-up should not appear again by default.
 */

const STORAGE_KEY = 'introducedSentences';

export interface IntroducedSentenceEntry {
  sentenceId: string;
  introducedAt: string; // ISO timestamp
  completedAt: string; // ISO timestamp when mini-game completed
  bestTime?: number; // Best completion time in ms
  lastMismatchCount?: number; // Number of mismatches in last completion
  timesCompleted: number; // How many times the intro game was completed
}

interface IntroducedState {
  [sentenceId: string]: IntroducedSentenceEntry;
}

function loadState(): IntroducedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as IntroducedState;
  } catch (err) {
    console.warn('[introducedSentenceStorage] Failed to parse state', err);
    return {};
  }
}

function saveState(state: IntroducedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[introducedSentenceStorage] Failed to save state', err);
  }
}

/**
 * Check if a sentence has been introduced (seen the word-match pop-up)
 */
export function isSentenceIntroduced(sentenceId: string): boolean {
  const state = loadState();
  return !!state[sentenceId];
}

/**
 * Mark a sentence as introduced and save completion stats
 */
export function markSentenceIntroduced(
  sentenceId: string,
  stats: {
    completionTime: number; // in ms
    mismatchCount: number;
  }
) {
  const state = loadState();
  const existing = state[sentenceId];
  const now = new Date().toISOString();

  state[sentenceId] = {
    sentenceId,
    introducedAt: existing?.introducedAt ?? now,
    completedAt: now,
    bestTime: existing?.bestTime
      ? Math.min(existing.bestTime, stats.completionTime)
      : stats.completionTime,
    lastMismatchCount: stats.mismatchCount,
    timesCompleted: (existing?.timesCompleted ?? 0) + 1,
  };

  saveState(state);
}

/**
 * Get introduction stats for a specific sentence
 */
export function getIntroductionStats(sentenceId: string): IntroducedSentenceEntry | null {
  const state = loadState();
  return state[sentenceId] ?? null;
}

/**
 * Get all introduced sentences
 */
export function getAllIntroducedSentences(): IntroducedState {
  return loadState();
}

/**
 * Reset introduction status for a sentence (useful for testing/debugging)
 */
export function resetSentenceIntroduction(sentenceId: string) {
  const state = loadState();
  delete state[sentenceId];
  saveState(state);
}

/**
 * Session-level guard to prevent pop-up from appearing more than once per sentence per session
 */
const sessionShownSentences = new Set<string>();

export function hasShownInSession(sentenceId: string): boolean {
  return sessionShownSentences.has(sentenceId);
}

export function markShownInSession(sentenceId: string) {
  sessionShownSentences.add(sentenceId);
}

export function clearSessionGuard() {
  sessionShownSentences.clear();
}
