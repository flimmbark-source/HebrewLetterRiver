import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * PracticeSegmentPath
 *
 * Displays a downriver-style list of practice route stops. The path is visual;
 * the stop cards remain real UI controls so content stays responsive and localizable.
 */
export default function PracticeSegmentPath({ scenario, segments, onSelectSegment }) {
  const { t } = useLocalization();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
          {t('read.route.chooseStop', 'Choose a Route Stop')}
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('conversation.segments.title', 'Today’s Route')}
        </h3>
      </div>

      <div className="relative grid grid-cols-[3.5rem_1fr] gap-3 sm:grid-cols-[4.25rem_1fr] sm:gap-4">
        <div className="absolute left-[1.7rem] top-3 bottom-3 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#9dcfdd] via-[#5aa6a5] to-[#2f7d83] opacity-70 sm:left-[2.1rem]" aria-hidden="true" />
        <div className="absolute left-[1.2rem] top-8 bottom-8 w-6 rounded-full bg-[#e2f1ec]/50 blur-md sm:left-[1.6rem]" aria-hidden="true" />

        {segments.map((segment, index) => (
          <div key={segment.id} className="contents">
            <div className="relative flex justify-center pt-4">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#fff8e8] bg-[#2f6b4c] text-sm font-bold text-white shadow-lg">
                {index + 1}
              </div>
            </div>

            <button
              onClick={() => onSelectSegment(segment)}
              className="group relative mb-3 w-full rounded-[1.35rem] border bg-white/88 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:scale-[0.99] sm:p-5"
              style={{ borderColor: 'rgba(56, 93, 72, 0.14)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f6b4c]">
                    {t('read.route.stopLabel', 'Stop {{number}}', { number: index + 1 })}
                  </p>
                  <h4 className="mt-1 text-base font-bold leading-tight text-[#183d2e] sm:text-lg">
                    {t(`conversation.segments.${index + 1}.title`, segment.title || `Segment ${index + 1}`)}
                  </h4>
                  <p className="mt-1 text-xs leading-snug text-[#4e665b] sm:text-sm">
                    {t(
                      `conversation.segments.${index + 1}.description`,
                      `Practice ${segment.pairs.length} sentence pairs with progressive vocabulary`
                    )}
                  </p>
                </div>

                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf6ec] text-[#2f6b4c] transition group-hover:translate-x-0.5">
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">chevron_right</span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-[#5a6d62] sm:text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">notes</span>
                  {segment.pairs.length * 2} {t('conversation.segments.sentences', 'sentences')}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">flag</span>
                  {segment.plan.beats.length} {t('conversation.segments.exercises', 'exercises')}
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-[#fff8e8]/75 px-4 py-3 text-center text-xs font-medium leading-relaxed text-[#5a6d62] sm:text-sm" style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}>
        {t(
          'conversation.segments.info',
          'Each segment has 2 short intro sentences followed by 2 longer sentences that reuse the vocabulary.'
        )}
      </div>
    </div>
  );
}
