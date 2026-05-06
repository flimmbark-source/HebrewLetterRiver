import type { Sentence, SentenceProgressEntry, SentenceResult } from '../types/sentences.ts';

const STORAGE_KEY = 'sentenceProgress';

function scopedTheme(theme: string, practiceLanguageId = 'global') {
  return `${practiceLanguageId}:${theme}`;
}

interface ProgressState {
  [theme: string]: Record<string, SentenceProgressEntry>;
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ProgressState;
  } catch (err) {
    console.warn('[sentenceProgressStorage] Failed to parse progress', err);
    return {};
  }
}

function saveState(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[sentenceProgressStorage] Failed to save progress', err);
  }
}

export function recordSentenceResult(
  theme: string,
  sentenceId: string,
  result: SentenceResult,
  practiceLanguageId = 'global'
) {
  const state = loadState();
  const scopedKey = scopedTheme(theme, practiceLanguageId);
  const themeEntries = state[scopedKey] || {};
  const existing = themeEntries[sentenceId];
  const now = new Date().toISOString();

  themeEntries[sentenceId] = {
    sentenceId,
    theme,
    lastResult: result,
    attempts: (existing?.attempts ?? 0) + 1,
    updatedAt: now,
    nextReviewAt: existing?.nextReviewAt ?? null
  };

  state[scopedKey] = themeEntries;
  saveState(state);
}

export function getSentenceProgress(theme: string, sentenceId: string, practiceLanguageId = 'global'): SentenceProgressEntry | null {
  const state = loadState();
  return state[scopedTheme(theme, practiceLanguageId)]?.[sentenceId] ?? null;
}

export function getThemeStats(theme: string, sentences: Sentence[], practiceLanguageId = 'global') {
  const state = loadState();
  const entries = state[scopedTheme(theme, practiceLanguageId)] || {};
  const practiced = Object.keys(entries).length;
  const total = sentences.length;
  const correctCount = Object.values(entries).filter(entry => entry.lastResult === 'correct').length;
  return {
    practiced,
    total,
    correctCount,
    completionRate: total > 0 ? practiced / total : 0
  };
}

export function getNextSentenceIndex(theme: string, sentences: Sentence[], practiceLanguageId = 'global'): number {
  const state = loadState();
  const entries = state[scopedTheme(theme, practiceLanguageId)] || {};
  const firstUnseen = sentences.findIndex(sentence => !entries[sentence.id]);
  if (firstUnseen !== -1) return firstUnseen;
  if (sentences.length === 0) return -1;
  return 0;
}

export function getAllSentenceProgress(): ProgressState {
  return loadState();
}
