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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 sm:mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>{t('conversation.list.back', 'Back')}</span>
            </button>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            {t('conversation.list.title', 'Conversation Practice')}
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            {t('conversation.list.subtitle', 'Practice real-world Hebrew conversations')}
          </p>
        </div>

        {/* Intro message */}
        <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">💬</span>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1 text-sm sm:text-base">
                {t('conversation.list.intro.title', 'Learn through conversation')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {t('conversation.list.intro.description', 'Each scenario teaches you practical phrases through listening, speaking, and typing exercises.')}
              </p>
            </div>
          </div>
        </div>

        {/* Items grid */}
        <div className="grid gap-4">
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
                className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-4 sm:p-6 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-slate-100 mb-0.5 sm:mb-1">
                      {item.metadata.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {item.metadata.subtitle}
                    </p>
                  </div>

                  {/* Difficulty badge */}
                  <div className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 flex-shrink-0 ${getDifficultyColor(item.metadata.difficulty)}`}>
                    <span className="text-xs sm:text-sm">
                      {difficultyStars(item.metadata.difficulty)}
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
                    <span>{item.type === 'script' ? '🎭' : '💬'}</span>
                    <span>
                      {item.metadata.lineCount} {t('conversation.list.phrases', 'phrases')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
                    <span>🎯</span>
                    <span>
                      {item.metadata.beatsCount} {t('conversation.list.beats', 'beats')}
                    </span>
                  </div>

                  {hasProgress && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400">
                      <span>📊</span>
                      <span>
                        {item.stats.practicedLines}/{item.stats.totalLines} {t('conversation.list.practiced', 'practiced')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {hasProgress && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{t('conversation.list.progress', 'Progress')}</span>
                      <span>{Math.round(completionPercent)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer hint */}
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    {hasProgress
                      ? t('conversation.list.continue', 'Continue practicing')
                      : t('conversation.list.start', 'Start learning')
                    }
                  </span>
                  <span>→</span>
                </div>
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
