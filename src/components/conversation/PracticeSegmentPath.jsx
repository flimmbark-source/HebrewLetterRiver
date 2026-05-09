import { useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import verticalRiverRoutePath from '../../assets/Reading/vertical-river-route-path.png';

function getDefaultStopTitle(index) {
  if (index === 0) return 'Warm-up Phrases';
  if (index === 1) return 'Build the Scene';
  return 'Full Exchange';
}

function getDefaultStopDescription(index) {
  if (index === 0) return 'Learn key words and simple introductions.';
  if (index === 1) return 'Put phrases together in context.';
  return 'Have a complete back-and-forth conversation.';
}

function splitIntoRouteStops(segments) {
  if (!segments?.length) return [];

  if (segments.length <= 3) {
    return segments.map((segment, index) => ({
      id: `route-stop-${index + 1}`,
      title: getDefaultStopTitle(index),
      description: getDefaultStopDescription(index),
      segments: [segment],
      startSegment: segment,
    }));
  }

  const firstStopEnd = Math.ceil(segments.length / 3);
  const secondStopEnd = Math.ceil((segments.length * 2) / 3);
  const groups = [
    segments.slice(0, firstStopEnd),
    segments.slice(firstStopEnd, secondStopEnd),
    segments.slice(secondStopEnd),
  ].filter(group => group.length > 0);

  return groups.map((group, index) => ({
    id: `route-stop-${index + 1}`,
    title: getDefaultStopTitle(index),
    description: getDefaultStopDescription(index),
    segments: group,
    startSegment: group[0],
  }));
}

export default function PracticeSegmentPath({ scenario, segments, onSelectSegment }) {
  const { t } = useLocalization();
  const routeStops = useMemo(() => splitIntoRouteStops(segments), [segments]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-center">
        <span className="h-px w-8 bg-[#a6a06f]" aria-hidden="true" />
        <span className="material-symbols-outlined text-sm text-[#87945d]" aria-hidden="true">eco</span>
        <h3 className="text-sm font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('read.route.chooseStop', 'Choose a Route Stop')}
        </h3>
        <span className="material-symbols-outlined text-sm text-[#87945d]" aria-hidden="true">eco</span>
        <span className="h-px w-8 bg-[#a6a06f]" aria-hidden="true" />
      </div>

      <div className="relative min-h-[238px] pl-[4.6rem]">
        <img
          src={verticalRiverRoutePath}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-[-0.75rem] h-[calc(100%+1.25rem)] w-[12rem] object-cover object-left opacity-95"
        />

        <div className="space-y-2.5">
          {routeStops.map((routeStop, index) => (
            <button
              key={routeStop.id}
              onClick={() => onSelectSegment(routeStop)}
              className={`group relative min-h-[76px] w-full rounded-2xl border bg-[#fff8e8]/90 px-4 py-3 text-left shadow-sm backdrop-blur-[1px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:scale-[0.99] ${index === 1 ? 'border-[#2f6b4c]' : 'border-[#ded3ba]'}`}
            >
              <div className="absolute -left-[3.45rem] top-1/2 flex -translate-y-1/2 items-center">
                <span className="h-2 w-3 bg-[#2f6b4c]" aria-hidden="true" />
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f6b4c] text-sm font-bold text-white shadow-md ring-4 ring-[#fbf4e4]">
                  {index + 1}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 pr-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f6b4c]">
                    {t('read.route.stopLabel', 'Stop {{number}}', { number: index + 1 })}
                  </p>
                  <h4 className="mt-0.5 text-base font-bold leading-[1.05] text-[#183d2e]">
                    {t(`conversation.routeStops.${index + 1}.title`, routeStop.title)}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#4e665b]">
                    {t(
                      `conversation.routeStops.${index + 1}.description`,
                      routeStop.description
                    )}
                  </p>
                </div>

                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded3ba] bg-[#fffaf0] text-[#2f6b4c] transition group-hover:translate-x-0.5">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">volume_up</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
