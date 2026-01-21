/**
 * Storage for tracking which words have been introduced per conversation module.
 * Once a word is introduced within a module, the pop-up should not appear again for it.
 */

const STORAGE_KEY = 'introducedModuleWords';

export interface IntroducedModuleWordEntry {
  wordId: string;
  introducedAt: string;
  lastSeenAt: string;
  timesSeen: number;
}

export type IntroducedModuleWordState = Record<string, Record<string, IntroducedModuleWordEntry>>;

function loadState(): IntroducedModuleWordState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as IntroducedModuleWordState;
  } catch (err) {
    console.warn('[introducedModuleWordStorage] Failed to parse state', err);
    return {};
  }
}

function saveState(state: IntroducedModuleWordState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[introducedModuleWordStorage] Failed to save state', err);
  }
}

export function isModuleWordIntroduced(moduleId: string, wordId: string): boolean {
  if (!moduleId || !wordId) return false;
  const state = loadState();
  return !!state[moduleId]?.[wordId];
}

export function markModuleWordsIntroduced(moduleId: string, wordIds: string[]) {
  if (!moduleId || !wordIds.length) return;
  const state = loadState();
  const now = new Date().toISOString();
  if (!state[moduleId]) {
    state[moduleId] = {};
  }

  wordIds.forEach((wordId) => {
    if (!wordId) return;
    const existing = state[moduleId][wordId];
    state[moduleId][wordId] = {
      wordId,
      introducedAt: existing?.introducedAt ?? now,
      lastSeenAt: now,
      timesSeen: (existing?.timesSeen ?? 0) + 1,
    };
  });

  saveState(state);
}

/**
 * Session-level guard to prevent pop-up from appearing more than once per word per module per session
 */
const sessionShownModuleWords = new Set<string>();

function getSessionKey(moduleId: string, wordId: string) {
  return `${moduleId}::${wordId}`;
}

export function hasShownModuleWordInSession(moduleId: string, wordId: string): boolean {
  if (!moduleId || !wordId) return false;
  return sessionShownModuleWords.has(getSessionKey(moduleId, wordId));
}

export function markModuleWordsShownInSession(moduleId: string, wordIds: string[]) {
  if (!moduleId || !wordIds.length) return;
  wordIds.forEach((wordId) => {
    if (!wordId) return;
    sessionShownModuleWords.add(getSessionKey(moduleId, wordId));
  });
}

export function clearModuleWordSessionGuard() {
  sessionShownModuleWords.clear();
}
