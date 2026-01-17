import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { allConversationScenarios } from '../../data/conversation/index.ts';
import { getScenarioStats } from '../../lib/conversationProgressStorage.ts';
import DualRoleConversationCardGrid from './DualRoleConversationCardGrid.jsx';
import { buildDualRoleConversationCardItems } from './dualRoleConversationCardData.js';

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
      return buildDualRoleConversationCardItems();
    }

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4 py-6 sm:p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm">{t('conversation.list.back', 'Back')}</span>
            </button>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {mode === 'dual-role'
              ? t('conversation.list.titleDualRole', 'Dual-Role Conversations')
              : t('conversation.list.title', 'Conversation Practice')}
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            {mode === 'dual-role'
              ? t('conversation.list.subtitleDualRole', 'Practice both sides of a conversation')
              : t('conversation.list.subtitle', 'Choose a scenario to begin')}
          </p>
        </div>

        {/* Items grid */}
        {mode === 'dual-role' ? (
          <DualRoleConversationCardGrid
            items={itemsWithStats}
            onSelect={(item) => onSelectScript?.(item.script, item.scenario)}
          />
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {itemsWithStats.map((item) => {
              const completionPercent = item.stats.completionRate * 100;
              const hasProgress = item.stats.practicedLines > 0;

              const handleClick = () => {
                if (item.type === 'scenario' && onSelectScenario) {
                  onSelectScenario(item.scenario);
                }
              };

              return (
                <button
                  key={item.metadata.id}
                  onClick={handleClick}
                  className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">
                        {item.metadata.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {item.metadata.subtitle}
                      </p>
                    </div>

                    {/* Difficulty badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 flex-shrink-0 text-xs sm:text-sm ${getDifficultyColor(item.metadata.difficulty)}`}>
                      <span>{difficultyStars(item.metadata.difficulty)}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm flex-wrap text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>
                        {item.metadata.lineCount} {t('conversation.list.phrases', 'phrases')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>
                        {item.metadata.beatsCount} {t('conversation.list.beats', 'beats')}
                      </span>
                    </div>
                    {hasProgress && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <span>📊</span>
                        <span>
                          {item.stats.practicedLines}/{item.stats.totalLines} {t('conversation.list.practiced', 'practiced')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {hasProgress && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
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
                </button>
              );
            })}
          </div>
        )}

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
