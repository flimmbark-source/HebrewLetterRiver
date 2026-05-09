import { useEffect } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import PracticeSegmentPath from './PracticeSegmentPath.jsx';
import riverBackground from '../../assets/Reading/River-Background.png';

function getDifficultyLabel(difficulty, t) {
  if (difficulty <= 2) return t('conversation.list.difficulty.easy', 'Easy');
  if (difficulty <= 4) return t('conversation.list.difficulty.medium', 'Medium');
  return t('conversation.list.difficulty.hard', 'Hard');
}

function getRouteIcon(theme = '') {
  const normalized = theme.toLowerCase();
  if (normalized.includes('food') || normalized.includes('cafe') || normalized.includes('café')) return 'local_cafe';
  if (normalized.includes('home') || normalized.includes('family')) return 'home';
  if (normalized.includes('time') || normalized.includes('number')) return 'hourglass_empty';
  return 'eco';
}

export default function ConversationBriefScreen({ scenario, onStart, onStartSegment, onBack }) {
  const { t } = useLocalization();
  const hasSegments = scenario.segments && scenario.segments.length > 0;
  const canSelectSegments = hasSegments && typeof onStartSegment === 'function';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const routeTitle = t(scenario.metadata.titleKey, scenario.metadata.theme);
  const routeSubtitle = t(
    scenario.metadata.subtitleKey,
    `Practice ${scenario.metadata.theme.toLowerCase()}`
  );
  const routeIcon = getRouteIcon(`${scenario.metadata.theme || ''} ${routeTitle}`);

  const handleBeginRoute = () => {
    if (canSelectSegments && scenario.segments[0]) {
      onStartSegment(scenario.segments[0]);
    } else {
      onStart();
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf4e4] text-[#173d2e]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf4e4] px-5 pb-5 pt-4">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-cover bg-bottom opacity-70"
          style={{ backgroundImage: `url(${riverBackground})` }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fbf4e4]/10 via-[#fbf4e4]/65 to-[#fbf4e4]" aria-hidden="true" />

        <header className="relative z-10 grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-[#315846] shadow-sm transition hover:bg-white"
            aria-label={t('conversation.brief.back', 'Back to scenarios')}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          </button>
          <h1 className="truncate text-center text-lg font-bold text-[#1b352b]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {routeTitle}
          </h1>
          <div className="flex justify-end">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-[#315846] shadow-sm">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">menu_book</span>
            </span>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 flex-col pt-6">
          <section className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-[#fff8e8]/80 text-[#315846] shadow-inner">
              <span className="material-symbols-outlined text-5xl" aria-hidden="true">{routeIcon}</span>
            </div>
            <p className="mx-auto mt-5 max-w-[280px] text-[15px] font-medium leading-relaxed text-[#253d35]">
              {routeSubtitle}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/88 px-2 py-3 shadow-sm">
                <span className="material-symbols-outlined text-lg text-[#2f6b4c]" aria-hidden="true">eco</span>
                <div className="mt-0.5 text-sm font-bold text-[#183d2e]">{getDifficultyLabel(scenario.metadata.difficulty, t)}</div>
              </div>
              <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/88 px-2 py-3 shadow-sm">
                <span className="material-symbols-outlined text-lg text-[#2f6b4c]" aria-hidden="true">eco</span>
                <div className="mt-0.5 text-lg font-bold leading-none text-[#183d2e]">{scenario.metadata.lineCount}</div>
                <div className="text-[11px] font-semibold text-[#4e665b]">{t('conversation.brief.phrases', 'Phrases')}</div>
              </div>
              <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff9ea]/88 px-2 py-3 shadow-sm">
                <span className="material-symbols-outlined text-lg text-[#2f6b4c]" aria-hidden="true">waves</span>
                <div className="mt-0.5 text-lg font-bold leading-none text-[#183d2e]">{scenario.defaultPlan.beats.length}</div>
                <div className="text-[11px] font-semibold text-[#4e665b]">{t('conversation.brief.totalBeats', 'Beats')}</div>
              </div>
            </div>
          </section>

          <section className="mt-5 flex-1">
            {canSelectSegments ? (
              <PracticeSegmentPath
                scenario={scenario}
                segments={scenario.segments}
                onSelectSegment={onStartSegment}
              />
            ) : null}
          </section>

          <button
            onClick={handleBeginRoute}
            className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
            style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.28)' }}
          >
            <span>{t('read.route.begin', 'Begin Route')}</span>
            <span className="material-symbols-outlined text-xl" aria-hidden="true">eco</span>
          </button>
        </main>
      </div>
    </div>
  );
}
