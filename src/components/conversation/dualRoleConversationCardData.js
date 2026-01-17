import { allDualRoleScripts, getSourceScenarioForScript } from '../../data/conversation/dualRoleScripts.ts';
import { getScenarioStats } from '../../lib/conversationProgressStorage.ts';

export function buildDualRoleConversationCardItems(scripts = allDualRoleScripts) {
  return scripts.map(script => {
    const scenario = getSourceScenarioForScript(script);
    const stats = scenario
      ? getScenarioStats(scenario.metadata.id, script.turns.length)
      : { practicedLines: 0, totalLines: script.turns.length, completionRate: 0 };

    return {
      type: 'script',
      script,
      scenario,
      stats,
      metadata: {
        id: script.id,
        title: script.title,
        subtitle: script.description,
        lineCount: script.turns.length,
        difficulty: script.difficulty,
        beatsCount: script.turns.reduce((sum, turn) => sum + (turn.isNew !== false ? 2 : 1), 0)
      }
    };
  });
}
