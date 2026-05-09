import { useEffect, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import PracticeSegmentPath from './PracticeSegmentPath.jsx';
import riverBackground from '../../assets/Reading/River-Background.png';

function getDifficultyLabel(difficulty, t) {
  if (difficulty <= 2) return t('conversation.list.difficulty.easy', 'Easy');
  if (difficulty <= 4) return t('conversation.list.difficulty.medium', 'Medium');
  return t('conversation.list.difficulty.hard', 'Hard');
}

export default function ConversationBriefScreen({ scenario, onStartSegment, onBack }) {
  const { t } = useLocalization();
  const [selectedRouteStop, setSelectedRouteStop] = useState(null);
  const hasSegments = scenario.segments && scenario.segments.length > 0;
  const canSelectSegments = hasSegments && typeof onStartSegment === 'function';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('in-conversation-practice');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      document.body.classList.remove('in-conversation-practice');
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const routeTitle = t(scenario.metadata.titleKey, scenario.metadata.theme);

  const handleBeginRoute = () => {
    if (!selectedRouteStop) return;
    onStartSegment(selectedRouteStop);
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf4e4] px-5 pb-4 pt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-82"
            style={{ backgroundImage: `url(${riverBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf4e4]/0 via-[#fbf4e4]/52 to-[#fbf4e4]" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#fbf4e4] to-[#fbf4e4]/0" />
        </div>

        <header className="relative z-10 grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
            aria-label={t('conversation.brief.back', 'Back to scenarios')}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          </button>
          <h1 className="truncate text-center text-lg font-bold text-[#1b352b]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {routeTitle}
          </h1>
          <div className="flex justify-end">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">menu_book</span>
            </span>
          </div>
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col pt-5">
          <div className="mt-auto">
            <section className="text-center">
              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm">
                  <span className="material-symbols-outlined text-base text-[#2f6b4c]" aria-hidden="true">eco</span>
                  <div className="mt-0 text-sm font-bold text-[#183d2e]">{getDifficultyLabel(scenario.metadata.difficulty, t)}</div>
                </div>
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm">
                  <span className="material-symbols-outlined text-base text-[#2f6b4c]" aria-hidden="true">eco</span>
                  <div className="mt-0 text-base font-bold leading-none text-[#183d2e]">{scenario.metadata.lineCount}</div>
                  <div className="text-[10px] font-semibold text-[#4e665b]">{t('conversation.brief.phrases', 'Phrases')}</div>
                </div>
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm">
                  <span className="material-symbols-outlined text-base text-[#2f6b4c]" aria-hidden="true">waves</span>
                  <div className="mt-0 text-base font-bold leading-none text-[#183d2e]">{scenario.defaultPlan.beats.length}</div>
                  <div className="text-[10px] font-semibold text-[#4e665b]">{t('conversation.brief.totalBeats', 'Beats')}</div>
                </div>
              </div>
            </section>

            <section className="mt-3 shrink-0">
              {canSelectSegments ? (
                <PracticeSegmentPath
                  scenario={scenario}
                  segments={scenario.segments}
                  selectedRouteStopId={selectedRouteStop?.id}
                  onSelectRouteStop={setSelectedRouteStop}
                />
              ) : (
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-4 py-4 text-center text-sm font-semibold text-[#4e665b]">
                  {t('conversation.brief.noRouteStops', 'No route stops are available for this conversation yet.')}
                </div>
              )}
            </section>
          </div>

          {canSelectSegments && (
            <button
              type="button"
              onClick={handleBeginRoute}
              disabled={!selectedRouteStop}
              className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.28)' }}
            >
              <span>{t('read.route.begin', 'Begin Route')}</span>
              <span className="material-symbols-outlined text-xl" aria-hidden="true">eco</span>
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
