import { useMemo, useEffect } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { getModuleById } from '../../data/conversation/index.ts';
import PracticeSegmentPath from './PracticeSegmentPath.jsx';

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
export default function ConversationBriefScreen({ scenario, onStart, onStartSegment, onBack }) {
  const { t } = useLocalization();

  // Check if this scenario has segments (progressive vocabulary mode)
  const hasSegments = scenario.segments && scenario.segments.length > 0;

  // DEBUG: Log detailed segment data
  if (scenario.segments) {
    console.log('[ConversationBriefScreen] DETAILED SEGMENT ANALYSIS:');
    console.log('Segment count:', scenario.segments.length);

    scenario.segments.forEach((seg, idx) => {
      console.log(`\n--- SEGMENT ${idx + 1} (${seg.id}) ---`);
      console.log('Pairs:', JSON.stringify(seg.pairs, null, 2));
      console.log('Beat count:', seg.plan.beats.length);
      console.log('First 8 beat lineIds:', seg.plan.beats.slice(0, 8).map(b => b.lineId).join(', '));
      console.log('Plan name:', seg.plan.planName);
    });

    // Also check if all segments point to the same plan object
    if (scenario.segments.length > 1) {
      const samePlan = scenario.segments[0].plan === scenario.segments[1].plan;
      console.log('\n⚠️  All segments share same plan object?', samePlan);
    }
  } else {
    console.log('[ConversationBriefScreen] NO SEGMENTS FOUND');
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-start justify-center px-3 sm:px-4 pt-3 pb-3 sm:pb-6">
      <div className="max-w-2xl w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="text-lg sm:text-xl">←</span>
          <span className="text-sm sm:text-base">{t('conversation.brief.back', 'Back to scenarios')}</span>
        </button>

        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              {t(scenario.metadata.titleKey, scenario.metadata.theme)}
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              {t(scenario.metadata.subtitleKey, `Practice ${scenario.metadata.theme.toLowerCase()}`)}
            </p>

            {/* Difficulty + stats */}
            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">
                  {t('conversation.brief.difficulty', 'Difficulty')}:
                </span>
                <span className="text-base sm:text-lg text-amber-400">
                  {difficultyStars}
                </span>
                <span className="text-xs sm:text-sm text-slate-500">
                  ({scenario.metadata.difficulty}/5)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">
                  {t('conversation.brief.phrases', 'Phrases')}:
                </span>
                <span className="text-base sm:text-lg text-slate-200">
                  {scenario.metadata.lineCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-400">
                  {t('conversation.brief.totalBeats', 'Total beats')}:
                </span>
                <span className="text-base sm:text-lg text-slate-200">
                  {scenario.defaultPlan.beats.length}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Practice modules - compact */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-2 text-slate-200">
                {t('conversation.brief.practiceModules', 'Practice modules')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modulesUsed.map(module => (
                  <div
                    key={module.id}
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="text-2xl sm:text-3xl">{module.icon}</div>
                    <div className="text-[10px] sm:text-xs text-slate-300 text-center font-medium">
                      {t(module.nameKey, module.id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer - Segments path or Start button */}
          <div className="p-4 sm:p-6 bg-slate-800/50 border-t border-slate-700">
            {hasSegments ? (
              <PracticeSegmentPath
                scenario={scenario}
                segments={scenario.segments}
                onSelectSegment={onStartSegment || onStart}
              />
            ) : (
              <button
                onClick={onStart}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg rounded-lg transition-all duration-200 active:scale-95 shadow-lg"
              >
                {t('conversation.brief.start', 'Start Practice')} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
