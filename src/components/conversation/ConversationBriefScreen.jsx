import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { getModuleById } from '../../data/conversation/index.ts';

/**
 * ConversationBriefScreen
 *
 * Shows scenario overview before starting:
 * - Scenario title and subtitle
 * - Difficulty level
 * - Number of lines/beats
 * - Modules that will be used
 * - Start button
 */
export default function ConversationBriefScreen({ scenario, onStart, onBack }) {
  const { t } = useLocalization();

  // Get unique modules used in this scenario's plan
  const modulesUsed = useMemo(() => {
    const moduleIds = new Set(scenario.defaultPlan.beats.map(b => b.moduleId));
    return Array.from(moduleIds)
      .map(id => getModuleById(id))
      .filter(Boolean);
  }, [scenario]);

  // Difficulty stars
  const difficultyStars = '★'.repeat(scenario.metadata.difficulty) +
                         '☆'.repeat(5 - scenario.metadata.difficulty);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="text-xl">←</span>
          <span>{t('conversation.brief.back', 'Back to scenarios')}</span>
        </button>

        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-8">
            <h1 className="text-3xl font-bold mb-2">
              {t(scenario.metadata.titleKey, scenario.metadata.theme)}
            </h1>
            <p className="text-lg text-slate-300">
              {t(scenario.metadata.subtitleKey, `Practice ${scenario.metadata.theme.toLowerCase()}`)}
            </p>

            {/* Difficulty */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">
                {t('conversation.brief.difficulty', 'Difficulty')}:
              </span>
              <span className="text-xl text-amber-400">
                {difficultyStars}
              </span>
              <span className="text-sm text-slate-500">
                ({scenario.metadata.difficulty}/5)
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">
                  {t('conversation.brief.phrases', 'Phrases')}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {scenario.metadata.lineCount}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">
                  {t('conversation.brief.totalBeats', 'Total beats')}
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {scenario.defaultPlan.beats.length}
                </div>
              </div>
            </div>

            {/* Practice modules */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200">
                {t('conversation.brief.practiceModules', 'Practice modules')}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {t('conversation.brief.modulesDescription', 'You\'ll practice each phrase using these exercises:')}
              </p>

              <div className="grid gap-3">
                {modulesUsed.map(module => (
                  <div
                    key={module.id}
                    className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="text-3xl flex-shrink-0">{module.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">
                        {t(module.nameKey, module.id)}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {t(module.descriptionKey, `Practice with ${module.id}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning goals */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">
                    {t('conversation.brief.goals', 'Learning goals')}
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• {t('conversation.brief.goal1', 'Recognize and understand common Hebrew phrases')}</li>
                    <li>• {t('conversation.brief.goal2', 'Practice correct pronunciation')}</li>
                    <li>• {t('conversation.brief.goal3', 'Build recall and typing fluency')}</li>
                    <li>• {t('conversation.brief.goal4', 'Connect Hebrew words to real-world usage')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">
                    {t('conversation.brief.tips', 'Tips')}
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• {t('conversation.brief.tip1', 'Use the audio button to hear native pronunciation')}</li>
                    <li>• {t('conversation.brief.tip2', 'Save phrases you want to review later')}</li>
                    <li>• {t('conversation.brief.tip3', 'Take your time - there\'s no rush!')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-slate-800/50 border-t border-slate-700">
            <button
              onClick={onStart}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              {t('conversation.brief.start', 'Start Practice')} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
