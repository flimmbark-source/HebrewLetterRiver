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
 * A sentence pair (short intro + longer expansion)
 */
export interface SentencePair {
  /** Short intro sentence ID */
  shortSentenceId: string;
  /** Longer sentence ID that builds on the short one */
  longSentenceId: string;
}

/**
 * A practice segment containing multiple sentence pairs
 * Used for progressive vocabulary learning
 */
export interface PracticeSegment {
  /** Unique segment identifier */
  id: string;
  /** Index in the progression path (0-based) */
  index: number;
  /** Sentence pairs in this segment (typically 2 pairs = 4 sentences) */
  pairs: SentencePair[];
  /** Practice plan for this specific segment */
  plan: ConversationPracticePlan;
  /** Display title for this segment */
  title?: string;
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
  /** Practice segments for progressive vocabulary learning (optional) */
  segments?: PracticeSegment[];
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

/**
 * Dual-role conversation types for alternating A/B dialogue practice
 */

/** Speaker role in a dialogue turn */
export type SpeakerRole = 'A' | 'B';

/** Step type within a turn: introduce or reinforce */
export type TurnStepType = 'introduce' | 'reinforce';

/**
 * A single turn in a dual-role conversation
 * Each turn has one line and is executed as Introduce + Reinforce steps
 */
export interface ConversationTurn {
  /** Line ID for this turn */
  lineId: string;
  /** Which speaker says this line */
  role: SpeakerRole;
  /** Module pairing to use for this turn */
  pairing: 'listen-shadow' | 'type-choose';
  /** Whether this line is considered "new" (requires reinforcement) */
  isNew?: boolean;
}

/**
 * A complete dual-role conversation script
 * Represents a short dialogue sequence with alternating A/B turns
 */
export interface DualRoleConversationScript {
  /** Unique script identifier */
  id: string;
  /** Title/name of this conversation */
  title: string;
  /** Description of the conversation context */
  description: string;
  /** Ordered array of turns (alternates A/B) */
  turns: ConversationTurn[];
  /** Source scenario ID (optional) */
  sourceScenarioId?: string;
  /** Difficulty level (1-5) */
  difficulty: number;
}

/**
 * A single step within a turn (either introduce or reinforce)
 */
export interface TurnStep {
  /** Unique identifier for this step */
  id: string;
  /** Line ID being practiced */
  lineId: string;
  /** Speaker role */
  role: SpeakerRole;
  /** Step type within the turn */
  stepType: TurnStepType;
  /** Module to use for this step */
  moduleId: ConversationModuleType;
  /** Configuration for this step */
  config?: Record<string, any>;
}

/**
 * Dual-role session state
 * Extends the regular session with turn tracking
 */
export interface DualRoleSessionState extends ConversationSessionState {
  /** The dual-role script being practiced */
  script: DualRoleConversationScript;
  /** Current turn index in the script */
  currentTurnIndex: number;
  /** Current step within the turn (0 = introduce, 1 = reinforce) */
  currentStepInTurn: number;
  /** All steps expanded from the script */
  steps: TurnStep[];
}
