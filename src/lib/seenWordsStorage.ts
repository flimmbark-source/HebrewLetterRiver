/**
 * Storage for tracking which words a player has seen in the FloatingCapsulesGame.
 * Seen words will be filtered out from future game sessions.
 */

const STORAGE_KEY = 'seenWords';

export interface SeenWordEntry {
  wordId: string;
  firstSeenAt: string; // ISO timestamp
  timesSeenInGames: number; // How many games this word appeared in
}

interface SeenWordsState {
  [wordId: string]: SeenWordEntry;
}

function loadState(): SeenWordsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as SeenWordsState;
  } catch (err) {
    console.warn('[seenWordsStorage] Failed to parse state', err);
    return {};
  }
}

function saveState(state: SeenWordsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[seenWordsStorage] Failed to save state', err);
  }
}

/**
 * Check if a word has been seen before
 */
export function isWordSeen(wordId: string): boolean {
  const state = loadState();
  return !!state[wordId];
}

/**
 * Mark words as seen (typically called after completing a game)
 */
export function markWordsSeen(wordIds: string[]) {
  const state = loadState();
  const now = new Date().toISOString();

  for (const wordId of wordIds) {
    const existing = state[wordId];
    state[wordId] = {
      wordId,
      firstSeenAt: existing?.firstSeenAt ?? now,
      timesSeenInGames: (existing?.timesSeenInGames ?? 0) + 1,
    };
  }

  saveState(state);
}

/**
 * Get seen word stats for a specific word
 */
export function getSeenWordStats(wordId: string): SeenWordEntry | null {
  const state = loadState();
  return state[wordId] ?? null;
}

/**
 * Get all seen words
 */
export function getAllSeenWords(): SeenWordsState {
  return loadState();
}

/**
 * Reset seen status for a word (useful for testing/debugging)
 */
export function resetWordSeen(wordId: string) {
  const state = loadState();
  delete state[wordId];
  saveState(state);
}

/**
 * Clear all seen words (useful for testing/debugging)
 */
export function clearAllSeenWords() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[seenWordsStorage] Failed to clear state', err);
  }
}
