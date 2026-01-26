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

  return (
    <div className="space-y-2">
      <h3 className="text-sm sm:text-base font-semibold mb-3 text-slate-200 text-center">
        {t('conversation.segments.title', 'Choose a Practice Segment')}
      </h3>

      <div className="flex flex-col items-center gap-2">
        {segments.map((segment, index) => {
          const isFirst = index === 0;
          const isLast = index === segments.length - 1;

          return (
            <div key={segment.id} className="w-full flex flex-col items-center">
              {/* Connector line (above segment, except for first) */}
              {!isFirst && (
                <div className="w-1 h-4 bg-gradient-to-b from-slate-600 to-slate-700" />
              )}

              {/* Segment button */}
              <button
                onClick={() => {
                  console.log('[PracticeSegmentPath] Clicked segment:', {
                    id: segment.id,
                    pairs: segment.pairs,
                    firstBeatLineId: segment.plan.beats[0]?.lineId,
                    first5BeatLineIds: segment.plan.beats.slice(0, 5).map(b => b.lineId)
                  });
                  onSelectSegment(segment);
                }}
                className="w-full max-w-md group relative bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900/50 hover:to-purple-900/50 border-2 border-slate-700 hover:border-blue-500/50 rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
              >
                {/* Segment number badge */}
                <div className="absolute -left-3 -top-3 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-slate-900">
                  {index + 1}
                </div>

                <div className="space-y-2">
                  {/* Header */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-100">
                    {t(`conversation.segments.${index + 1}.title`, segment.title || `Segment ${index + 1}`)}
                  </h4>

                  {/* Subheader */}
                  <p className="text-xs sm:text-sm text-slate-400">
                    {t(
                      `conversation.segments.${index + 1}.description`,
                      `Practice ${segment.pairs.length} sentence pairs with progressive vocabulary`
                    )}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>📝 {segment.pairs.length * 2} {t('conversation.segments.sentences', 'sentences')}</span>
                    <span>•</span>
                    <span>🎯 {segment.plan.beats.length} {t('conversation.segments.exercises', 'exercises')}</span>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl">
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
          'Each segment has 2 short intro sentences followed by 2 longer sentences that reuse the vocabulary.'
        )}
      </div>
    </div>
  );
}
