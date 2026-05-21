import { useEffect, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import PracticeSegmentPath from './PracticeSegmentPath.jsx';
import Icon from '../Icon.jsx';
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
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    return () => {
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
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf4e4] px-5 pb-[calc(var(--bottom-nav-safe-space)+8px)] pt-10 md:max-w-[960px] md:px-8 md:pb-[calc(var(--bottom-nav-height)+96px)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden md:h-44" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-82"
            style={{ backgroundImage: `url(${riverBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf4e4]/0 via-[#fbf4e4]/52 to-[#fbf4e4]" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#fbf4e4] to-[#fbf4e4]/0" />
        </div>

        <header className="relative z-10 grid grid-cols-[2.5rem_1fr_2.5rem] items-center md:mx-auto md:w-full md:max-w-[680px]">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
            aria-label={t('conversation.brief.back', 'Back to scenarios')}
          >
            <Icon name="arrow_back" className="text-xl" aria-hidden="true" />
          </button>
          <h1 className="truncate text-center text-lg font-bold text-[#1b352b] md:text-2xl" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {routeTitle}
          </h1>
          <div className="flex justify-end">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm">
              <Icon name="menu_book" className="text-xl" aria-hidden="true" />
            </span>
          </div>
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col pt-3 md:items-center md:pt-4">
          <div className="mt-auto md:mt-0 md:w-full md:max-w-[820px]">
            <section className="text-center md:mx-auto md:max-w-[560px]">
              <div className="mt-1 grid grid-cols-3 gap-2 md:mt-0 md:gap-3">
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm md:py-3">
                  <Icon name="eco" className="text-base text-[#2f6b4c]" aria-hidden="true" />
                  <div className="mt-0 text-sm font-bold text-[#183d2e] md:text-base">{getDifficultyLabel(scenario.metadata.difficulty, t)}</div>
                </div>
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm md:py-3">
                  <Icon name="eco" className="text-base text-[#2f6b4c]" aria-hidden="true" />
                  <div className="mt-0 text-base font-bold leading-none text-[#183d2e] md:text-lg">{scenario.metadata.lineCount}</div>
                  <div className="text-[10px] font-semibold text-[#4e665b] md:text-xs">{t('conversation.brief.phrases', 'Phrases')}</div>
                </div>
                <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/90 px-2 py-2 shadow-sm md:py-3">
                  <Icon name="waves" className="text-base text-[#2f6b4c]" aria-hidden="true" />
                  <div className="mt-0 text-base font-bold leading-none text-[#183d2e] md:text-lg">{scenario.defaultPlan.beats.length}</div>
                  <div className="text-[10px] font-semibold text-[#4e665b] md:text-xs">{t('conversation.brief.totalBeats', 'Beats')}</div>
                </div>
              </div>
            </section>

            <div className="md:mt-4 md:grid md:w-full md:grid-cols-[minmax(0,560px)_220px] md:items-start md:justify-center md:gap-6">
              <section className="mt-3 shrink-0 md:mt-0">
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

              {canSelectSegments && (
                <aside className="mt-3 md:mt-[2.2rem] md:flex md:self-start">
                  <button
                    type="button"
                    onClick={handleBeginRoute}
                    disabled={!selectedRouteStop}
                    className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[76px] md:px-5 md:py-3 md:text-lg"
                    style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.28)' }}
                  >
                    <span>{t('read.route.begin', 'Begin Route')}</span>
                    <Icon name="eco" className="text-xl" aria-hidden="true" />
                  </button>
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
