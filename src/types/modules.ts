import type { Sentence } from './sentences';

/**
 * Represents a vocabulary item to be learned in a module
 */
export interface VocabItem {
  id: string;
  hebrew: string;
  transliteration?: string;
  meaning: string;
  partOfSpeech?: string;
}

/**
 * Represents a grammar pattern with examples using module vocab
 */
export interface GrammarPattern {
  id: string;
  name: string; // e.g., "Present Tense", "Verb + Infinitive"
  description: string;
  examples: Array<{
    hebrew: string;
    english: string;
    highlightedWord?: string; // which word demonstrates the pattern
  }>;
}

/**
 * Represents a learning module with vocab, grammar, and sentences
 */
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  order: number; // for sequencing in the learning path

  // Content
  vocabTextId: string; // ID of reading text for vocab practice
  grammar: GrammarPattern[];
  sentenceIds: string[]; // references to sentences in the sentence data

  // Progression
  prerequisiteModuleId?: string; // which module must be completed first
}

/**
 * Progress tracking for a module
 */
export interface ModuleProgress {
  moduleId: string;
  vocabPracticed: boolean; // has user practiced vocab cards
  grammarPracticed: boolean; // has user practiced grammar cards
  sentencesCompleted: number; // how many sentences completed successfully
  totalSentences: number; // total sentences in module
  isCompleted: boolean; // all requirements met
  unlockedAt?: string; // when module was unlocked
  completedAt?: string; // when module was completed
}
