/**
 * Dual-Role Conversation Practice
 *
 * Implements a conversation-like learning loop where the learner plays both sides
 * of a dialogue (Speaker A and Speaker B). Each turn alternates between roles and
 * uses a paired Introduce+Reinforce module sequence.
 */

import type { Sentence } from '../../types/sentences.ts';
import type {
  ConversationLine,
  ConversationModuleType,
  DualRoleConversationScript,
  ConversationTurn,
  TurnStep,
  SpeakerRole,
  ConversationProgressEntry
} from './types.ts';
import { sentenceToLine } from './scenarioFactory.ts';
import { getScenarioProgress } from '../../lib/conversationProgressStorage.ts';

/**
 * Module pairings for dual-role practice
 *
 * Listening → Shadow: For "heard line" turns (Speaker A)
 * Type → Choose: For "spoken response" turns (Speaker B)
 */
export const MODULE_PAIRINGS = {
  'listen-shadow': {
    introduce: 'listenMeaningChoice' as ConversationModuleType,
    reinforce: 'shadowRepeat' as ConversationModuleType
  },
  'type-choose': {
    introduce: 'typeInput' as ConversationModuleType,
    reinforce: 'guidedReplyChoice' as ConversationModuleType
  }
} as const;

/**
 * Default conversation rhythm: alternates pairing types to create dialogue feel
 * Speaker A uses listen-shadow, Speaker B uses type-choose
 */
function getRolePairing(role: SpeakerRole): 'listen-shadow' | 'type-choose' {
  return role === 'A' ? 'listen-shadow' : 'type-choose';
}

/**
 * Determine if a line is "new" based on existing progress
 * A line is "new" if:
 * - It has never been attempted, OR
 * - It has fewer than 2 attempts, OR
 * - The last result was not 'correct'
 */
export function isLineNew(
  lineId: string,
  scenarioId: string
): boolean {
  const progress = getScenarioProgress(scenarioId);

  if (!progress || !progress.lineProgress[lineId]) {
    return true; // Never practiced
  }

  const lineProgress = progress.lineProgress[lineId];

  // Consider "new" if not mastered (less than 2 attempts or last was not correct)
  return lineProgress.attempts < 2 || lineProgress.lastResult !== 'correct';
}

/**
 * Generate a dual-role conversation script from sentences
 *
 * @param sentences - Array of sentences to use (should be 4-6 lines)
 * @param scriptId - Unique identifier for this script
 * @param title - Display title
 * @param description - Context description
 * @param scenarioId - Source scenario ID (for progress lookup)
 * @returns A complete dual-role conversation script
 */
export function generateDualRoleScript(
  sentences: Sentence[],
  scriptId: string,
  title: string,
  description: string,
  scenarioId?: string
): DualRoleConversationScript {
  // Limit to 4-6 lines for MVP
  const limitedSentences = sentences.slice(0, Math.min(6, sentences.length));

  // Create turns alternating A/B
  const turns: ConversationTurn[] = limitedSentences.map((sentence, index) => {
    const role: SpeakerRole = index % 2 === 0 ? 'A' : 'B';
    const pairing = getRolePairing(role);
    const isNew = scenarioId ? isLineNew(sentence.id, scenarioId) : true;

    return {
      lineId: sentence.id,
      role,
      pairing,
      isNew
    };
  });

  // Calculate average difficulty
  const avgDifficulty = limitedSentences.reduce((sum, s) => sum + s.difficulty, 0) / limitedSentences.length;

  return {
    id: scriptId,
    title,
    description,
    turns,
    sourceScenarioId: scenarioId,
    difficulty: Math.round(avgDifficulty)
  };
}

/**
 * Expand a turn into its constituent steps (Introduce + optional Reinforce)
 *
 * @param turn - The turn to expand
 * @param turnIndex - Index of this turn in the script
 * @param skipReinforceForKnown - Whether to skip reinforce step for known lines
 * @returns Array of 1-2 steps
 */
export function expandTurnToSteps(
  turn: ConversationTurn,
  turnIndex: number,
  skipReinforceForKnown: boolean = false
): TurnStep[] {
  const pairing = MODULE_PAIRINGS[turn.pairing];
  const steps: TurnStep[] = [];

  // Always add Introduce step
  steps.push({
    id: `turn-${turnIndex}-introduce`,
    lineId: turn.lineId,
    role: turn.role,
    stepType: 'introduce',
    moduleId: pairing.introduce,
    config: {
      turn: turnIndex,
      role: turn.role
    }
  });

  // Add Reinforce step if:
  // - Line is new (isNew === true or undefined), OR
  // - Not skipping reinforce for known lines
  const shouldReinforce = turn.isNew !== false || !skipReinforceForKnown;

  if (shouldReinforce) {
    steps.push({
      id: `turn-${turnIndex}-reinforce`,
      lineId: turn.lineId,
      role: turn.role,
      stepType: 'reinforce',
      moduleId: pairing.reinforce,
      config: {
        turn: turnIndex,
        role: turn.role
      }
    });
  }

  return steps;
}

/**
 * Expand an entire script into a sequence of steps
 *
 * @param script - The dual-role conversation script
 * @param skipReinforceForKnown - Whether to skip reinforce for known lines
 * @returns Array of all steps in execution order
 */
export function expandScriptToSteps(
  script: DualRoleConversationScript,
  skipReinforceForKnown: boolean = false
): TurnStep[] {
  const allSteps: TurnStep[] = [];

  script.turns.forEach((turn, index) => {
    const steps = expandTurnToSteps(turn, index, skipReinforceForKnown);
    allSteps.push(...steps);
  });

  return allSteps;
}

/**
 * Generate a beginner-friendly conversation script from existing content
 * Selects high-frequency beginner sentences forming a coherent micro-scene
 *
 * @param sentencesByTheme - All available sentences organized by theme
 * @param themeKey - Theme to use (e.g., "Greetings & Introductions")
 * @param scriptId - Unique identifier
 * @param scenarioId - Source scenario ID (optional, for progress tracking)
 * @returns A dual-role conversation script
 */
export function generateBeginnerScript(
  sentencesByTheme: Record<string, Sentence[]>,
  themeKey: string,
  scriptId: string,
  scenarioId?: string
): DualRoleConversationScript | null {
  const sentences = sentencesByTheme[themeKey];

  if (!sentences || sentences.length === 0) {
    return null;
  }

  // Filter for beginner sentences (difficulty 1-2)
  const beginnerSentences = sentences.filter(s => s.difficulty <= 2);

  // If not enough beginner sentences, use all available up to difficulty 3
  const selectedSentences = beginnerSentences.length >= 4
    ? beginnerSentences
    : sentences.filter(s => s.difficulty <= 3);

  if (selectedSentences.length < 4) {
    return null; // Not enough content
  }

  // For MVP, limit to 4 turns to keep sessions short
  const finalSentences = selectedSentences.slice(0, 4);

  // Check progress to determine how many are "new"
  let newCount = 0;
  if (scenarioId) {
    finalSentences.forEach(s => {
      if (isLineNew(s.id, scenarioId)) {
        newCount++;
      }
    });

    // If more than 2 new lines, try to rebalance
    if (newCount > 2) {
      // Find known sentences to substitute
      const knownSentences = selectedSentences.filter(s =>
        !isLineNew(s.id, scenarioId)
      );

      if (knownSentences.length > 0) {
        // Replace some new sentences with known ones
        // Keep first 2 new, add 2 known
        const newSentences = finalSentences.filter(s =>
          isLineNew(s.id, scenarioId)
        ).slice(0, 2);
        const knownToAdd = knownSentences.slice(0, 2);

        finalSentences.splice(0, finalSentences.length, ...newSentences, ...knownToAdd);
      }
    }
  }

  return generateDualRoleScript(
    finalSentences,
    scriptId,
    themeKey,
    `Practice a ${themeKey.toLowerCase()} conversation by playing both sides`,
    scenarioId
  );
}

/**
 * Create a simple greeting conversation (for demo/testing)
 */
export function createGreetingScript(
  sentencesByTheme: Record<string, Sentence[]>,
  scenarioId?: string
): DualRoleConversationScript | null {
  return generateBeginnerScript(
    sentencesByTheme,
    'Greetings & Introductions',
    'greeting-conversation-1',
    scenarioId
  );
}

/**
 * Session runner helper: Get the current step from session state
 */
export function getCurrentStep(
  steps: TurnStep[],
  currentBeatIndex: number
): TurnStep | null {
  return steps[currentBeatIndex] || null;
}

/**
 * Session runner helper: Check if session is complete
 */
export function isSessionComplete(
  steps: TurnStep[],
  currentBeatIndex: number
): boolean {
  return currentBeatIndex >= steps.length;
}

/**
 * Session runner helper: Get progress statistics
 */
export function getSessionStats(
  steps: TurnStep[],
  currentBeatIndex: number
) {
  const totalSteps = steps.length;
  const completedSteps = currentBeatIndex;
  const remainingSteps = Math.max(0, totalSteps - completedSteps);

  // Count turns (groups of steps)
  const uniqueTurns = new Set(steps.map(s => s.config?.turn)).size;
  const completedTurns = new Set(
    steps.slice(0, currentBeatIndex).map(s => s.config?.turn)
  ).size;

  return {
    totalSteps,
    completedSteps,
    remainingSteps,
    totalTurns: uniqueTurns,
    completedTurns,
    progressPercent: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  };
}
