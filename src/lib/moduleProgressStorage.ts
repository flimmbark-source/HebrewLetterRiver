import type { ModuleProgress } from '../types/modules';
import { learningModules } from '../data/modules';

const STORAGE_KEY = 'hebrewLetterRiver_moduleProgress';

/**
 * Migrate old progress data to new schema
 */
function migrateProgressData(progress: any): ModuleProgress {
  // If old schema (vocabPracticed boolean), migrate to new schema
  if ('vocabPracticed' in progress && !('vocabSectionsPracticed' in progress)) {
    const module = learningModules.find(m => m.id === progress.moduleId);
    return {
      ...progress,
      vocabSectionsPracticed: progress.vocabPracticed
        ? (module?.vocabTextIds || [module?.vocabTextIds?.[0] || 'module-1-vocab']).slice(0, 1)
        : [],
      totalVocabSections: module?.vocabTextIds?.length || 1,
    };
  }

  // Ensure totalVocabSections exists
  if (!progress.totalVocabSections) {
    const module = learningModules.find(m => m.id === progress.moduleId);
    progress.totalVocabSections = module?.vocabTextIds?.length || 1;
  }

  // Ensure vocabSectionsPracticed is an array
  if (!progress.vocabSectionsPracticed) {
    progress.vocabSectionsPracticed = [];
  }

  return progress;
}

/**
 * Get all module progress from localStorage
 */
function getAllProgress(): Record<string, ModuleProgress> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {};
  }
  try {
    const parsed = JSON.parse(stored);
    // Migrate old data
    const migrated: Record<string, ModuleProgress> = {};
    for (const key in parsed) {
      migrated[key] = migrateProgressData(parsed[key]);
    }
    return migrated;
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
export function initializeModuleProgress(moduleId: string, totalSentences: number, totalVocabSections: number = 1): ModuleProgress {
  const existing = getModuleProgress(moduleId);
  if (existing) {
    return existing;
  }

  const newProgress: ModuleProgress = {
    moduleId,
    vocabSectionsPracticed: [],
    grammarPracticed: false,
    sentencesCompleted: 0,
    totalSentences,
    totalVocabSections,
    isCompleted: false,
    unlockedAt: new Date().toISOString(),
  };

  const allProgress = getAllProgress();
  allProgress[moduleId] = newProgress;
  saveAllProgress(allProgress);

  return newProgress;
}

/**
 * Mark a vocab section as practiced for a module
 */
export function markVocabSectionPracticed(moduleId: string, vocabTextId: string): void {
  const allProgress = getAllProgress();
  const progress = allProgress[moduleId];

  if (progress && !progress.vocabSectionsPracticed.includes(vocabTextId)) {
    progress.vocabSectionsPracticed.push(vocabTextId);
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
  // Handle old progress data
  const totalVocabSections = progress.totalVocabSections || 1;
  const vocabSectionsPracticed = progress.vocabSectionsPracticed || [];

  const allVocabCompleted = vocabSectionsPracticed.length >= totalVocabSections;

  if (
    allVocabCompleted &&
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
      initializeModuleProgress(
        nextModule.id,
        nextModule.sentenceIds.length,
        nextModule.vocabTextIds.length
      );
    }
  }
}

/**
 * Get completion percentage for a module
 */
export function getModuleCompletionPercentage(moduleId: string): number {
  const progress = getModuleProgress(moduleId);
  if (!progress) return 0;

  // Handle old progress data that doesn't have totalVocabSections
  const totalVocabSections = progress.totalVocabSections || 1;
  const vocabSectionsPracticed = progress.vocabSectionsPracticed || [];

  let completed = 0;
  let total = totalVocabSections + 2; // all vocab sections + grammar + sentences

  // Count completed vocab sections
  completed += vocabSectionsPracticed.length;

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
      initializeModuleProgress(
        firstModule.id,
        firstModule.sentenceIds.length,
        firstModule.vocabTextIds.length
      );
    }
  }
}
