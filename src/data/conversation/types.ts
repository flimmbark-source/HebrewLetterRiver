/**
 * Conversation Mode Types
 *
 * Defines the data structures for conversation practice scenarios,
 * conversation lines, practice modules, and beat results.
 */

import type { Sentence } from '../../types/sentences.ts';

/**
 * A single conversational line derived from a sentence
 */
export interface ConversationLine {
  /** Unique line identifier (derived from sentence ID) */
  id: string;
  /** Hebrew text */
  he: string;
  /** Transliteration / pronunciation guide */
  tl?: string;
  /** English translation */
  en: string;
  /** Audio file path (if pre-recorded exists) */
  audio?: string;
  /** Acceptable variants from pattern or acceptable property */
  acceptableVariants?: {
    hebrew?: string[];
    english?: string[];
    transliteration?: string[];
  };
  /** Original sentence data for reference */
  sentenceData: Sentence;
}

/**
 * Module types for conversation practice
 */
export type ConversationModuleType =
  | 'listenMeaningChoice'
  | 'shadowRepeat'
  | 'guidedReplyChoice'
  | 'typeInput';

/**
 * Practice module definition
 */
export interface ConversationModule {
  id: ConversationModuleType;
  /** Display name key for i18n */
  nameKey: string;
  /** Description key for i18n */
  descriptionKey: string;
  /** Icon or emoji for visual representation */
  icon: string;
}

/**
 * A single practice beat (line + module combination)
 */
export interface ConversationBeat {
  /** Line ID to practice */
  lineId: string;
  /** Module to use for practice */
  moduleId: ConversationModuleType;
  /** Optional: specific configuration for this beat */
  config?: Record<string, any>;
}

/**
 * Practice plan for a conversation scenario
 */
export interface ConversationPracticePlan {
  /** Scenario ID this plan belongs to */
  scenarioId: string;
  /** Ordered array of beats to practice */
  beats: ConversationBeat[];
  /** Optional: name for this plan variant */
  planName?: string;
}

/**
 * Result of a single module attempt
 */
export interface ConversationAttemptResult {
  /** The beat that was attempted */
  beat: ConversationBeat;
  /** User's response/input */
  userResponse: string;
  /** Whether the attempt was correct/passed */
  isCorrect: boolean;
  /** Detailed result type */
  resultType: 'correct' | 'partial' | 'incorrect';
  /** Suggested best answer (if user was incorrect) */
  suggestedAnswer?: string;
  /** Timestamp of attempt */
  timestamp: string;
  /** Optional: score or confidence (0-1) */
  score?: number;
}

/**
 * Conversation scenario metadata
 */
export interface ConversationScenarioMetadata {
  /** Unique scenario identifier */
  id: string;
  /** Theme name (from sentencesByTheme) or Cafe Talk category */
  theme: string;
  /** Display title (multilingual via i18n key) */
  titleKey: string;
  /** Display subtitle (multilingual via i18n key) */
  subtitleKey: string;
  /** Number of lines in scenario */
  lineCount: number;
  /** Average difficulty (1-5) */
  difficulty: number;
  /** Source: 'sentencesByTheme' or 'cafeTalk' */
  source: 'sentencesByTheme' | 'cafeTalk';
}

/**
 * Complete conversation scenario
 */
export interface ConversationScenario {
  /** Scenario metadata */
  metadata: ConversationScenarioMetadata;
  /** All conversational lines in this scenario */
  lines: ConversationLine[];
  /** Default practice plan */
  defaultPlan: ConversationPracticePlan;
  /** Alternative practice plans */
  alternativePlans?: ConversationPracticePlan[];
}

/**
 * Session state for active conversation practice
 */
export interface ConversationSessionState {
  /** Scenario being practiced */
  scenarioId: string;
  /** Active practice plan */
  plan: ConversationPracticePlan;
  /** Current beat index */
  currentBeatIndex: number;
  /** All attempt results in this session */
  attemptHistory: ConversationAttemptResult[];
  /** Lines saved to SRS during this session */
  savedLineIds: string[];
  /** Session start time */
  startedAt: string;
  /** Session completion time */
  completedAt?: string;
}

/**
 * Persistent conversation progress for a scenario
 */
export interface ConversationProgressEntry {
  /** Scenario ID */
  scenarioId: string;
  /** Lines that have been practiced (lineId -> attempt count) */
  lineProgress: Record<string, {
    attempts: number;
    lastResult: 'correct' | 'partial' | 'incorrect';
    lastAttemptAt: string;
  }>;
  /** Total beats completed across all sessions */
  totalBeatsCompleted: number;
  /** Last session date */
  lastSessionAt: string;
  /** Placeholder for future spaced repetition */
  nextReviewAt?: string;
}
