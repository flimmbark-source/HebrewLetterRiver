import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { allConversationScenarios } from '../../data/conversation/index.ts';
import { getScenarioStats } from '../../lib/conversationProgressStorage.ts';

/**
 * ConversationScenarioList
 *
 * Shows a list of all available conversation scenarios.
 * Displays title, subtitle, difficulty, line count, and progress.
 */
export default function ConversationScenarioList({ onSelectScenario, onBack }) {
  const { t } = useLocalization();

  // Calculate stats for each scenario
  const scenariosWithStats = useMemo(() => {
    return allConversationScenarios.map(scenario => {
      const stats = getScenarioStats(scenario.metadata.id, scenario.metadata.lineCount);
      return { scenario, stats };
    });
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>{t('conversation.list.back', 'Back')}</span>
            </button>
          )}

          <h1 className="text-4xl font-bold mb-2">
            {t('conversation.list.title', 'Conversation Practice')}
          </h1>
          <p className="text-lg text-slate-400">
            {t('conversation.list.subtitle', 'Practice real-world Hebrew conversations')}
          </p>
        </div>

        {/* Intro message */}
        <div className="mb-6 p-5 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">
                {t('conversation.list.intro.title', 'Learn through conversation')}
              </h3>
              <p className="text-sm text-slate-300">
                {t('conversation.list.intro.description', 'Each scenario teaches you practical phrases through listening, speaking, and typing exercises.')}
              </p>
            </div>
          </div>
        </div>

        {/* Scenarios grid */}
        <div className="grid gap-4">
          {scenariosWithStats.map(({ scenario, stats }) => {
            const completionPercent = stats.completionRate * 100;
            const hasProgress = stats.practicedLines > 0;

            return (
              <button
                key={scenario.metadata.id}
                onClick={() => onSelectScenario(scenario)}
                className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-all duration-200 hover:scale-102 active:scale-98 shadow-lg hover:shadow-xl"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-100 mb-1">
                      {t(scenario.metadata.titleKey, scenario.metadata.theme)}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {t(scenario.metadata.subtitleKey, `Practice ${scenario.metadata.theme.toLowerCase()}`)}
                    </p>
                  </div>

                  {/* Difficulty badge */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 ${getDifficultyColor(scenario.metadata.difficulty)}`}>
                    <span className="text-sm">
                      {difficultyStars(scenario.metadata.difficulty)}
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>💬</span>
                    <span>
                      {scenario.metadata.lineCount} {t('conversation.list.phrases', 'phrases')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span>🎯</span>
                    <span>
                      {scenario.defaultPlan.beats.length} {t('conversation.list.beats', 'beats')}
                    </span>
                  </div>

                  {hasProgress && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <span>📊</span>
                      <span>
                        {stats.practicedLines}/{stats.totalLines} {t('conversation.list.practiced', 'practiced')}
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

        {/* Empty state (if no scenarios) */}
        {scenariosWithStats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg text-slate-400">
              {t('conversation.list.empty', 'No scenarios available yet')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
