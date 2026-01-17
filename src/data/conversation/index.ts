/**
 * Conversation Mode Data
 *
 * Main entry point for conversation scenario data and utilities.
 */

import { sentencesByTheme } from '../sentences/index.ts';
import { buildAllScenarios } from './scenarioFactory.ts';
import type { ConversationScenario, ConversationModule } from './types.ts';

/**
 * All available conversation scenarios
 */
export const allConversationScenarios: ConversationScenario[] = buildAllScenarios(sentencesByTheme);

/**
 * Module definitions for conversation practice
 */
export const conversationModules: ConversationModule[] = [
  {
    id: 'listenMeaningChoice',
    nameKey: 'conversation.modules.listenMeaningChoice.name',
    descriptionKey: 'conversation.modules.listenMeaningChoice.description',
    icon: '🎧'
  },
  {
    id: 'shadowRepeat',
    nameKey: 'conversation.modules.shadowRepeat.name',
    descriptionKey: 'conversation.modules.shadowRepeat.description',
    icon: '🗣️'
  },
  {
    id: 'guidedReplyChoice',
    nameKey: 'conversation.modules.guidedReplyChoice.name',
    descriptionKey: 'conversation.modules.guidedReplyChoice.description',
    icon: '💬'
  },
  {
    id: 'typeInput',
    nameKey: 'conversation.modules.typeInput.name',
    descriptionKey: 'conversation.modules.typeInput.description',
    icon: '⌨️'
  }
];

/**
 * Get scenario by ID
 */
export function getScenarioById(scenarioId: string): ConversationScenario | undefined {
  return allConversationScenarios.find(s => s.metadata.id === scenarioId);
}

/**
 * Get scenarios by difficulty range
 */
export function getScenariosByDifficulty(minDiff: number, maxDiff: number): ConversationScenario[] {
  return allConversationScenarios.filter(
    s => s.metadata.difficulty >= minDiff && s.metadata.difficulty <= maxDiff
  );
}

/**
 * Get module definition by ID
 */
export function getModuleById(moduleId: string): ConversationModule | undefined {
  return conversationModules.find(m => m.id === moduleId);
}

// Re-export types
export * from './types.ts';
export * from './scenarioFactory.ts';

// Re-export dual-role exports
export * from './dualRoleConversation.ts';
export * from './dualRoleScripts.ts';
