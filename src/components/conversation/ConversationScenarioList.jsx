import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { allConversationScenarios } from '../../data/conversation/index.ts';
import { allDualRoleScripts, getSourceScenarioForScript } from '../../data/conversation/dualRoleScripts.ts';
import { getScenarioStats } from '../../lib/conversationProgressStorage.ts';

/**
 * ConversationScenarioList
 *
 * Shows a list of all available conversation scenarios or dual-role scripts.
 * Displays title, subtitle, difficulty, line count, and progress.
 */
export default function ConversationScenarioList({
  onSelectScenario,
  onSelectScript,
  onBack,
  mode = 'regular'
}) {
  const { t } = useLocalization();

  // Calculate stats for scenarios or scripts based on mode
  const itemsWithStats = useMemo(() => {
    if (mode === 'dual-role') {
      // Dual-role scripts
      return allDualRoleScripts.map(script => {
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
    } else {
      // Regular scenarios
      return allConversationScenarios.map(scenario => {
        const stats = getScenarioStats(scenario.metadata.id, scenario.metadata.lineCount);
        return {
          type: 'scenario',
          scenario,
          stats,
          metadata: {
            id: scenario.metadata.id,
            title: t(scenario.metadata.titleKey, scenario.metadata.theme),
            subtitle: t(scenario.metadata.subtitleKey, `Practice ${scenario.metadata.theme.toLowerCase()}`),
            lineCount: scenario.metadata.lineCount,
            difficulty: scenario.metadata.difficulty,
            beatsCount: scenario.defaultPlan.beats.length
          }
        };
      });
    }
  }, [mode, t]);

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'text-emerald-400';
    if (difficulty <= 3) return 'text-blue-400';
    if (difficulty <= 4) return 'text-amber-400';
    return 'text-red-400';
  };

  const difficultyStars = (difficulty) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-3xl w-full">
        {/* Header - compact */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-2 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="text-base sm:text-lg">←</span>
            <span className="text-xs sm:text-sm">{t('conversation.list.back', 'Back')}</span>
          </button>
        )}

        <h1 className="text-lg sm:text-xl font-bold mb-3 text-center">
          {mode === 'dual-role' ? 'Dual-Role Conversations' : 'Choose a Scenario'}
        </h1>

        {/* Items grid - compact */}
        <div className="grid gap-2">
          {itemsWithStats.map((item) => {
            const completionPercent = item.stats.completionRate * 100;
            const hasProgress = item.stats.practicedLines > 0;

            const handleClick = () => {
              if (item.type === 'script' && onSelectScript) {
                onSelectScript(item.script, item.scenario);
              } else if (item.type === 'scenario' && onSelectScenario) {
                onSelectScenario(item.scenario);
              }
            };

            return (
              <button
                key={item.metadata.id}
                onClick={handleClick}
                className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-lg p-3 sm:p-3.5 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-tight mb-1">
                      {item.metadata.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                      {item.metadata.subtitle}
                    </p>
                  </div>

                  {/* Difficulty badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 border border-slate-700 flex-shrink-0 text-[10px] sm:text-xs ${getDifficultyColor(item.metadata.difficulty)}`}>
                    <span>{difficultyStars(item.metadata.difficulty)}</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span>{item.type === 'script' ? '🎭' : '💬'}</span>
                    <span>{item.metadata.lineCount} phrases</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{item.metadata.beatsCount} beats</span>
                  </div>
                  {hasProgress && (
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <span>📊</span>
                      <span>{item.stats.practicedLines}/{item.stats.totalLines}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {hasProgress && (
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty state (if no items) */}
        {itemsWithStats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{mode === 'dual-role' ? '🎭' : '📚'}</div>
            <p className="text-lg text-slate-400">
              {mode === 'dual-role'
                ? 'No dual-role scripts available yet'
                : t('conversation.list.empty', 'No scenarios available yet')
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
