import { useLocalization } from '../../context/LocalizationContext.jsx';

function getDefaultStopTitle(index, segment) {
  if (index === 0) return 'Warm-up Phrases';
  if (index === 1) return 'Build the Scene';
  if (index === 2) return 'Full Exchange';
  return segment.title || `Segment ${index + 1}`;
}

function getDefaultStopDescription(index, segment) {
  if (index === 0) return 'Learn key words and simple introductions.';
  if (index === 1) return 'Put phrases together in context.';
  if (index === 2) return 'Have a complete back-and-forth conversation.';
  return `Practice ${segment.pairs.length} sentence pairs with progressive vocabulary`;
}

export default function PracticeSegmentPath({ scenario, segments, onSelectSegment }) {
  const { t } = useLocalization();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 text-center">
        <span className="h-px w-8 bg-[#a6a06f]" aria-hidden="true" />
        <span className="material-symbols-outlined text-base text-[#87945d]" aria-hidden="true">eco</span>
        <h3 className="text-base font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('read.route.chooseStop', 'Choose a Route Stop')}
        </h3>
        <span className="material-symbols-outlined text-base text-[#87945d]" aria-hidden="true">eco</span>
        <span className="h-px w-8 bg-[#a6a06f]" aria-hidden="true" />
      </div>

      <div className="relative pl-[4.25rem]">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[4rem] overflow-hidden" aria-hidden="true">
          <div className="absolute left-3 top-0 h-full w-8 rounded-full bg-gradient-to-b from-[#9ed0d8] via-[#5aa6a5] to-[#2f7d83] opacity-65 blur-[0.2px]" />
          <div className="absolute left-1 top-2 h-10 w-10 rounded-full bg-[#d8e6dd]/70 blur-md" />
          <div className="absolute left-0 top-20 h-10 w-10 rounded-full bg-[#d8e6dd]/60 blur-md" />
          <div className="absolute bottom-3 left-0 h-14 w-14 rounded-full bg-[#d8e6dd]/70 blur-md" />
        </div>

        <div className="space-y-3">
          {segments.map((segment, index) => (
            <button
              key={segment.id}
              onClick={() => onSelectSegment(segment)}
              className={`group relative w-full rounded-2xl border bg-[#fff8e8]/88 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:scale-[0.99] ${index === 1 ? 'border-[#2f6b4c]' : 'border-[#ded3ba]'}`}
            >
              <div className="absolute -left-[3.15rem] top-1/2 flex -translate-y-1/2 items-center">
                <span className="h-2 w-3 bg-[#2f6b4c]" aria-hidden="true" />
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f6b4c] text-sm font-bold text-white shadow-md ring-4 ring-[#fbf4e4]">
                  {index + 1}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-base font-bold leading-tight text-[#183d2e]">
                    {t(`conversation.segments.${index + 1}.title`, `Stop ${index + 1}: ${getDefaultStopTitle(index, segment)}`)}
                  </h4>
                  <p className="mt-1 text-xs leading-snug text-[#4e665b] sm:text-sm">
                    {t(
                      `conversation.segments.${index + 1}.description`,
                      getDefaultStopDescription(index, segment)
                    )}
                  </p>
                </div>

                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ded3ba] bg-[#fffaf0] text-[#2f6b4c] transition group-hover:translate-x-0.5">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">volume_up</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
