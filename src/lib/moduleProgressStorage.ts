import type { ModuleProgress } from '../types/modules';
import { learningModules } from '../data/modules';

const STORAGE_KEY = 'hebrewLetterRiver_moduleProgress';

/**
 * Get all module progress from localStorage
 */
function getAllProgress(): Record<string, ModuleProgress> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse module progress:', e);
    return {};
  }
}

/**
 * Save all module progress to localStorage
 */
function saveAllProgress(progress: Record<string, ModuleProgress>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Get progress for a specific module
 */
export function getModuleProgress(moduleId: string): ModuleProgress | null {
  const allProgress = getAllProgress();
  return allProgress[moduleId] || null;
}

/**
 * Initialize progress for a module if it doesn't exist
 */
export function initializeModuleProgress(moduleId: string, totalSentences: number): ModuleProgress {
  const existing = getModuleProgress(moduleId);
  if (existing) {
    return existing;
  }

  const newProgress: ModuleProgress = {
    moduleId,
    vocabPracticed: false,
    grammarPracticed: false,
    sentencesCompleted: 0,
    totalSentences,
    isCompleted: false,
    unlockedAt: new Date().toISOString(),
  };

  const allProgress = getAllProgress();
  allProgress[moduleId] = newProgress;
  saveAllProgress(allProgress);

  return newProgress;
}

/**
 * Mark vocab as practiced for a module
 */
export function markVocabPracticed(moduleId: string): void {
  const allProgress = getAllProgress();
  const progress = allProgress[moduleId];

  if (progress) {
    progress.vocabPracticed = true;
    checkAndMarkCompleted(progress);
    saveAllProgress(allProgress);
  }
}

/**
 * Mark grammar as practiced for a module
 */
export function markGrammarPracticed(moduleId: string): void {
  const allProgress = getAllProgress();
  const progress = allProgress[moduleId];

  if (progress) {
    progress.grammarPracticed = true;
    checkAndMarkCompleted(progress);
    saveAllProgress(allProgress);
  }
}

/**
 * Increment the number of completed sentences for a module
 */
export function incrementSentenceCompletion(moduleId: string): void {
  const allProgress = getAllProgress();
  const progress = allProgress[moduleId];

  if (progress) {
    progress.sentencesCompleted = Math.min(
      progress.sentencesCompleted + 1,
      progress.totalSentences
    );
    checkAndMarkCompleted(progress);
    saveAllProgress(allProgress);
  }
}

/**
 * Update sentence completion count based on actual sentence progress
 * This syncs module progress with sentence progress storage
 */
export function syncSentenceCompletion(moduleId: string, completedCount: number): void {
  const allProgress = getAllProgress();
  const progress = allProgress[moduleId];

  if (progress) {
    progress.sentencesCompleted = Math.min(completedCount, progress.totalSentences);
    checkAndMarkCompleted(progress);
    saveAllProgress(allProgress);
  }
}

/**
 * Check if module meets completion criteria and mark as completed
 */
function checkAndMarkCompleted(progress: ModuleProgress): void {
  if (
    progress.vocabPracticed &&
    progress.grammarPracticed &&
    progress.sentencesCompleted >= progress.totalSentences &&
    !progress.isCompleted
  ) {
    progress.isCompleted = true;
    progress.completedAt = new Date().toISOString();
  }
}

/**
 * Check if a module is unlocked based on prerequisites
 */
export function isModuleUnlocked(moduleId: string): boolean {
  const module = learningModules.find(m => m.id === moduleId);
  if (!module) return false;

  // First module is always unlocked
  if (module.order === 1) return true;

  // Check if prerequisite module is completed
  if (module.prerequisiteModuleId) {
    const prereqProgress = getModuleProgress(module.prerequisiteModuleId);
    return prereqProgress?.isCompleted || false;
  }

  return false;
}

/**
 * Get all unlocked modules
 */
export function getUnlockedModules(): string[] {
  return learningModules
    .filter(module => isModuleUnlocked(module.id))
    .map(module => module.id);
}

/**
 * Auto-unlock the next module if current module is completed
 */
export function autoUnlockNextModule(completedModuleId: string): void {
  const completedModule = learningModules.find(m => m.id === completedModuleId);
  if (!completedModule) return;

  // Find the next module that has this as a prerequisite
  const nextModule = learningModules.find(
    m => m.prerequisiteModuleId === completedModuleId
  );

  if (nextModule && isModuleUnlocked(nextModule.id)) {
    // Initialize progress for the newly unlocked module
    const existingProgress = getModuleProgress(nextModule.id);
    if (!existingProgress) {
      initializeModuleProgress(nextModule.id, nextModule.sentenceIds.length);
    }
  }
}

/**
 * Get completion percentage for a module
 */
export function getModuleCompletionPercentage(moduleId: string): number {
  const progress = getModuleProgress(moduleId);
  if (!progress) return 0;

  let completed = 0;
  let total = 3; // vocab, grammar, sentences

  if (progress.vocabPracticed) completed++;
  if (progress.grammarPracticed) completed++;
  if (progress.sentencesCompleted >= progress.totalSentences) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Reset all module progress (for testing/debugging)
 */
export function resetAllModuleProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize the first module for new users
 */
export function initializeFirstModule(): void {
  const firstModule = learningModules.find(m => m.order === 1);
  if (firstModule) {
    const existingProgress = getModuleProgress(firstModule.id);
    if (!existingProgress) {
      initializeModuleProgress(firstModule.id, firstModule.sentenceIds.length);
    }
  }
}
