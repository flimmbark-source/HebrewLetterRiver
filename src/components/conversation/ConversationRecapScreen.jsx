import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * ConversationRecapScreen
 *
 * Shows session summary after completion:
 * - Performance stats
 * - Phrases practiced
 * - Saved phrases
 * - Actions: finish, practice again, review saved phrases
 */
export default function ConversationRecapScreen({
  scenario,
  attemptHistory,
  savedLineIds,
  onFinish,
  onPracticeAgain,
  onReviewSaved
}) {
  const { t } = useLocalization();

  // Calculate stats
  const stats = useMemo(() => {
    const total = attemptHistory.length;
    const correct = attemptHistory.filter(a => a.isCorrect).length;
    const partial = attemptHistory.filter(a => a.resultType === 'partial').length;
    const incorrect = attemptHistory.filter(a => a.resultType === 'incorrect').length;

    const uniqueLines = new Set(attemptHistory.map(a => a.beat.lineId)).size;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return {
      total,
      correct,
      partial,
      incorrect,
      uniqueLines,
      accuracy
    };
  }, [attemptHistory]);

  // Get performance message based on accuracy
  const performanceMessage = useMemo(() => {
    if (stats.accuracy >= 90) {
      return {
        emoji: '🌟',
        title: t('conversation.recap.excellent', 'Excellent!'),
        message: t('conversation.recap.excellentMsg', 'You\'re mastering these phrases!')
      };
    } else if (stats.accuracy >= 70) {
      return {
        emoji: '👍',
        title: t('conversation.recap.great', 'Great job!'),
        message: t('conversation.recap.greatMsg', 'You\'re making solid progress!')
      };
    } else if (stats.accuracy >= 50) {
      return {
        emoji: '💪',
        title: t('conversation.recap.good', 'Good effort!'),
        message: t('conversation.recap.goodMsg', 'Keep practicing and you\'ll improve!')
      };
    } else {
      return {
        emoji: '📚',
        title: t('conversation.recap.keepGoing', 'Keep going!'),
        message: t('conversation.recap.keepGoingMsg', 'Learning takes time - you\'re on the right track!')
      };
    }
  }, [stats.accuracy, t]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-slate-700 p-8 text-center">
            <div className="text-6xl mb-4">{performanceMessage.emoji}</div>
            <h1 className="text-3xl font-bold mb-2">{performanceMessage.title}</h1>
            <p className="text-lg text-slate-300">{performanceMessage.message}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Scenario info */}
            <div className="text-center pb-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200">
                {t(scenario.metadata.titleKey, scenario.metadata.theme)}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {t('conversation.recap.completed', 'Session completed')}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Accuracy */}
              <div className="col-span-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-2">
                    {t('conversation.recap.accuracy', 'Accuracy')}
                  </div>
                  <div className="text-5xl font-bold text-blue-400">
                    {Math.round(stats.accuracy)}%
                  </div>
                </div>
              </div>

              {/* Beats completed */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">
                  {t('conversation.recap.beatsCompleted', 'Beats completed')}
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {stats.total}
                </div>
              </div>

              {/* Phrases practiced */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">
                  {t('conversation.recap.phrasesPracticed', 'Phrases practiced')}
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {stats.uniqueLines}
                </div>
              </div>
            </div>

            {/* Performance breakdown */}
            <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-slate-200">
                {t('conversation.recap.breakdown', 'Performance breakdown')}
              </h3>
              <div className="space-y-3">
                {/* Correct */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="text-slate-300">
                      {t('conversation.recap.correct', 'Correct')}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">
                    {stats.correct}
                  </span>
                </div>

                {/* Partial */}
                {stats.partial > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <span className="text-slate-300">
                        {t('conversation.recap.partial', 'Partial')}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-amber-400">
                      {stats.partial}
                    </span>
                  </div>
                )}

                {/* Incorrect */}
                {stats.incorrect > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">❌</span>
                      <span className="text-slate-300">
                        {t('conversation.recap.incorrect', 'Incorrect')}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-red-400">
                      {stats.incorrect}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Saved phrases */}
            {savedLineIds.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💾</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200 mb-1">
                      {t('conversation.recap.savedPhrases', 'Saved phrases')}
                    </h4>
                    <p className="text-sm text-slate-300">
                      {t('conversation.recap.savedCount', 'You saved {{count}} phrases for review', {
                        count: savedLineIds.length
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 bg-slate-800/50 border-t border-slate-700 space-y-3">
            {/* Finish */}
            <button
              onClick={onFinish}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              {t('conversation.recap.finish', 'Finish')} ✓
            </button>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onPracticeAgain}
                className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all duration-200"
              >
                🔄 {t('conversation.recap.practiceAgain', 'Practice again')}
              </button>

              {savedLineIds.length > 0 && (
                <button
                  onClick={onReviewSaved}
                  className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all duration-200"
                >
                  📚 {t('conversation.recap.reviewSaved', 'Review saved')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
