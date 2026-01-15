/**
 * Dual-Role Conversation Scripts
 *
 * Pre-generated conversation scripts for dual-role practice mode.
 * These scripts are built from existing sentence content and represent
 * short dialogues where the learner plays both sides.
 */

import { sentencesByTheme } from '../sentences/index.ts';
import { allConversationScenarios } from './index.ts';
import {
  generateBeginnerScript,
  createGreetingScript,
  generateDualRoleScript
} from './dualRoleConversation.ts';
import type { DualRoleConversationScript } from './types.ts';

/**
 * Generate all dual-role scripts from available content
 */
function generateAllDualRoleScripts(): DualRoleConversationScript[] {
  const scripts: DualRoleConversationScript[] = [];

  // Find scenario IDs for progress tracking
  const getScenarioId = (themeKey: string) => {
    const scenario = allConversationScenarios.find(
      s => s.metadata.theme === themeKey
    );
    return scenario?.metadata.id;
  };

  // 1. Greetings & Introductions
  const greetingScript = generateBeginnerScript(
    sentencesByTheme,
    'Greetings & Introductions',
    'dual-greetings-1',
    getScenarioId('Greetings & Introductions')
  );
  if (greetingScript) {
    scripts.push(greetingScript);
  }

  // 2. At Home conversation
  const homeScript = generateBeginnerScript(
    sentencesByTheme,
    'At Home',
    'dual-home-1',
    getScenarioId('At Home')
  );
  if (homeScript) {
    scripts.push(homeScript);
  }

  // 3. Food & Eating conversation
  const foodScript = generateBeginnerScript(
    sentencesByTheme,
    'Food & Eating',
    'dual-food-1',
    getScenarioId('Food & Eating')
  );
  if (foodScript) {
    scripts.push(foodScript);
  }

  // 4. Numbers & Time conversation
  const timeScript = generateBeginnerScript(
    sentencesByTheme,
    'Numbers & Time',
    'dual-time-1',
    getScenarioId('Numbers & Time')
  );
  if (timeScript) {
    scripts.push(timeScript);
  }

  return scripts;
}

/**
 * All available dual-role conversation scripts
 */
export const allDualRoleScripts: DualRoleConversationScript[] = generateAllDualRoleScripts();

/**
 * Get a dual-role script by ID
 */
export function getDualRoleScriptById(scriptId: string): DualRoleConversationScript | undefined {
  return allDualRoleScripts.find(s => s.id === scriptId);
}

/**
 * Get dual-role scripts by difficulty
 */
export function getDualRoleScriptsByDifficulty(minDiff: number, maxDiff: number): DualRoleConversationScript[] {
  return allDualRoleScripts.filter(
    s => s.difficulty >= minDiff && s.difficulty <= maxDiff
  );
}

/**
 * Get the source scenario for a dual-role script
 */
export function getSourceScenarioForScript(script: DualRoleConversationScript) {
  if (!script.sourceScenarioId) return null;
  return allConversationScenarios.find(s => s.metadata.id === script.sourceScenarioId);
}
