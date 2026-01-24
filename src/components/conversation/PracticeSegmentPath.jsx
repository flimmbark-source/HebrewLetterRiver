import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * PracticeSegmentPath
 *
 * Displays a vertical path of practice segments, each representing
 * a pair of sentences (short + long) for progressive vocabulary learning.
 */
export default function PracticeSegmentPath({ scenario, segments, onSelectSegment }) {
  const { t } = useLocalization();

  // Get line details for each segment
  const segmentsWithLines = useMemo(() => {
    return segments.map(segment => {
      const shortLine = scenario.lines.find(l => l.id === segment.shortSentenceId);
      const longLine = scenario.lines.find(l => l.id === segment.longSentenceId);
      return {
        ...segment,
        shortLine,
        longLine
      };
    });
  }, [segments, scenario.lines]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm sm:text-base font-semibold mb-3 text-slate-200 text-center">
        {t('conversation.segments.title', 'Choose a Practice Segment')}
      </h3>

      <div className="flex flex-col items-center gap-2">
        {segmentsWithLines.map((segment, index) => {
          const isFirst = index === 0;
          const isLast = index === segmentsWithLines.length - 1;

          return (
            <div key={segment.id} className="w-full flex flex-col items-center">
              {/* Connector line (above segment, except for first) */}
              {!isFirst && (
                <div className="w-1 h-4 bg-gradient-to-b from-slate-600 to-slate-700" />
              )}

              {/* Segment button */}
              <button
                onClick={() => onSelectSegment(segment)}
                className="w-full max-w-md group relative bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900/50 hover:to-purple-900/50 border-2 border-slate-700 hover:border-blue-500/50 rounded-xl p-3 sm:p-4 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
              >
                {/* Segment number badge */}
                <div className="absolute -left-3 -top-3 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-slate-900">
                  {index + 1}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {/* Short sentence preview */}
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-slate-700/50">
                    <div className="text-[10px] sm:text-xs text-slate-400 mb-1">
                      {t('conversation.segments.intro', 'Intro')}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-200 text-right mb-1">
                      {segment.shortLine?.he}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {segment.shortLine?.en}
                    </div>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex justify-center">
                    <div className="text-blue-400 text-xs sm:text-sm">↓</div>
                  </div>

                  {/* Long sentence preview */}
                  <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-slate-700/50">
                    <div className="text-[10px] sm:text-xs text-slate-400 mb-1">
                      {t('conversation.segments.expand', 'Expand')}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-200 text-right mb-1">
                      {segment.longLine?.he}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {segment.longLine?.en}
                    </div>
                  </div>

                  {/* Beats count */}
                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500">
                      {segment.plan.beats.length} {t('conversation.segments.exercises', 'exercises')}
                    </span>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                  →
                </div>
              </button>

              {/* Connector line (below segment, except for last) */}
              {!isLast && (
                <div className="w-1 h-4 bg-gradient-to-b from-slate-700 to-slate-600" />
              )}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="mt-4 text-center text-xs sm:text-sm text-slate-400 px-4">
        {t(
          'conversation.segments.info',
          'Each segment starts with a short sentence and builds to a longer one using the same vocabulary.'
        )}
      </div>
    </div>
  );
}
