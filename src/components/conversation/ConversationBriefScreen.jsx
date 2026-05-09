import { useMemo, useEffect } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { getModuleById } from '../../data/conversation/index.ts';
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
  return 'map';
}

/**
 * ConversationBriefScreen
 *
 * Shows the selected conversation route before starting practice.
 */
export default function ConversationBriefScreen({ scenario, onStart, onStartSegment, onBack }) {
  const { t } = useLocalization();

  const hasSegments = scenario.segments && scenario.segments.length > 0;
  const canSelectSegments = hasSegments && typeof onStartSegment === 'function';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const modulesUsed = useMemo(() => {
    const moduleIds = new Set(scenario.defaultPlan.beats.map(b => b.moduleId));
    return Array.from(moduleIds)
      .map(id => getModuleById(id))
      .filter(Boolean);
  }, [scenario]);

  const routeTitle = t(scenario.metadata.titleKey, scenario.metadata.theme);
  const routeSubtitle = t(
    scenario.metadata.subtitleKey,
    `Practice ${scenario.metadata.theme.toLowerCase()}`
  );
  const routeIcon = getRouteIcon(`${scenario.metadata.theme || ''} ${routeTitle}`);

  return (
    <div className="min-h-screen px-3 pb-5 pt-3 sm:px-4 sm:py-6" style={{ background: 'linear-gradient(180deg, #f8f1df, #eef7ee)' }}>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-[#315846] shadow-sm transition hover:bg-white"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
          <span>{t('conversation.brief.back', 'Back to scenarios')}</span>
        </button>

        <section className="relative overflow-hidden rounded-[2rem] border shadow-xl" style={{ borderColor: 'rgba(35, 90, 72, 0.12)', boxShadow: '0 18px 44px rgba(25, 68, 55, 0.14)' }}>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${riverBackground})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e8]/95 via-[#fff8e8]/80 to-[#f1f8ef]/96" aria-hidden="true" />

          <div className="relative p-5 sm:p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border bg-white/80 text-[#315846] shadow-inner" style={{ borderColor: 'rgba(56, 93, 72, 0.12)' }}>
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">{routeIcon}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f6b4c]">
                {t('read.route.briefEyebrow', 'Route Brief')}
              </p>
              <h1 className="mt-1 text-3xl font-bold leading-tight text-[#163d2e] sm:text-4xl" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
                {routeTitle}
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-relaxed text-[#4e665b] sm:text-base">
                {routeSubtitle}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border bg-white/80 p-3 text-center shadow-sm" style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}>
                <div className="text-xs font-semibold text-[#5a6d62]">{t('conversation.brief.difficulty', 'Difficulty')}</div>
                <div className="mt-1 text-sm font-bold text-[#183d2e]">{getDifficultyLabel(scenario.metadata.difficulty, t)}</div>
              </div>
              <div className="rounded-2xl border bg-white/80 p-3 text-center shadow-sm" style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}>
                <div className="text-xs font-semibold text-[#5a6d62]">{t('conversation.brief.phrases', 'Phrases')}</div>
                <div className="mt-1 text-sm font-bold text-[#183d2e]">{scenario.metadata.lineCount}</div>
              </div>
              <div className="rounded-2xl border bg-white/80 p-3 text-center shadow-sm" style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}>
                <div className="text-xs font-semibold text-[#5a6d62]">{t('conversation.brief.totalBeats', 'Beats')}</div>
                <div className="mt-1 text-sm font-bold text-[#183d2e]">{scenario.defaultPlan.beats.length}</div>
              </div>
            </div>

            {modulesUsed.length > 0 && (
              <div className="mt-5 rounded-[1.5rem] border bg-white/65 p-4 shadow-sm" style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}>
                <h3 className="mb-3 text-sm font-bold text-[#183d2e]">
                  {t('conversation.brief.practiceModules', 'Practice modules')}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {modulesUsed.map(module => (
                    <div
                      key={module.id}
                      className="flex flex-col items-center gap-1 rounded-2xl border bg-[#fffaf0]/80 p-3 text-center"
                      style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}
                    >
                      <div className="text-2xl">{module.icon}</div>
                      <div className="text-[11px] font-semibold leading-tight text-[#51685d]">
                        {t(module.nameKey, module.id)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative border-t p-4 sm:p-6" style={{ borderColor: 'rgba(56, 93, 72, 0.10)', background: 'rgba(255, 250, 240, 0.72)' }}>
            {canSelectSegments ? (
              <PracticeSegmentPath
                scenario={scenario}
                segments={scenario.segments}
                onSelectSegment={onStartSegment}
              />
            ) : (
              <button
                onClick={onStart}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
                style={{ background: 'linear-gradient(180deg, #c77912, #af650e)', boxShadow: '0 10px 24px rgba(175, 101, 14, 0.25)' }}
              >
                <span>{t('conversation.brief.start', 'Start Practice')}</span>
                <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
