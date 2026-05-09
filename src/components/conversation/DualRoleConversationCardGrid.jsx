import PropTypes from 'prop-types';
import { useLocalization } from '../../context/LocalizationContext.jsx';

function getRouteAccent(item) {
  const haystack = `${item.metadata?.title || ''} ${item.metadata?.subtitle || ''} ${item.metadata?.theme || ''}`.toLowerCase();

  if (haystack.includes('home') || haystack.includes('family')) {
    return { icon: 'home', ribbon: '#d6c9a4', dot: '#c99022' };
  }

  if (haystack.includes('time') || haystack.includes('number')) {
    return { icon: 'hourglass_empty', ribbon: '#9bb6b8', dot: '#c99022' };
  }

  if (haystack.includes('food') || haystack.includes('cafe') || haystack.includes('café')) {
    return { icon: 'local_cafe', ribbon: '#3f7a55', dot: '#2f7d4c' };
  }

  return { icon: 'eco', ribbon: '#6d8f6a', dot: '#2f7d4c' };
}

function getDifficultyLabel(difficulty, t) {
  if (difficulty <= 2) return t('conversation.list.difficulty.easy', 'Easy');
  if (difficulty <= 4) return t('conversation.list.difficulty.medium', 'Medium');
  return t('conversation.list.difficulty.hard', 'Hard');
}

export default function DualRoleConversationCardGrid({ items, onSelect, className = '' }) {
  const { t } = useLocalization();

  return (
    <div className={`grid gap-3 sm:gap-4 ${className}`.trim()}>
      {items.map((item) => {
        const completionPercent = item.stats.completionRate * 100;
        const hasProgress = item.stats.practicedLines > 0;
        const accent = getRouteAccent(item);
        const actionLabel = hasProgress
          ? t('read.route.continue', 'Continue')
          : t('read.route.start', 'Start Route');

        return (
          <button
            key={item.metadata.id}
            onClick={() => onSelect?.(item)}
            className="group relative w-full overflow-hidden rounded-[1.35rem] border bg-[#fff8e8]/95 p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] sm:p-4"
            style={{
              borderColor: 'rgba(56, 93, 72, 0.16)',
              boxShadow: '0 10px 28px rgba(35, 70, 58, 0.08)'
            }}
          >
            <span
              className="absolute left-0 top-0 h-full w-2"
              style={{ background: accent.ribbon }}
              aria-hidden="true"
            />

            <div className="flex gap-3 pl-2 sm:gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-white/70 text-[#315846] shadow-inner sm:h-20 sm:w-20"
                style={{ borderColor: 'rgba(56, 93, 72, 0.10)' }}
              >
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">
                  {accent.icon}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold leading-tight text-[#183d2e] sm:text-lg">
                      {item.metadata.title}
                    </h3>
                    {item.metadata.subtitle && (
                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-[#4e665b] sm:text-sm">
                        {item.metadata.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-[#315846] shadow-sm">
                    <span className="h-2 w-2 rounded-full" style={{ background: accent.dot }} />
                    {getDifficultyLabel(item.metadata.difficulty, t)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-[#51685d] sm:text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">psychiatry</span>
                    {item.metadata.lineCount} {t('conversation.list.phrases', 'phrases')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">waves</span>
                    {item.metadata.beatsCount} {t('conversation.list.beats', 'beats')}
                  </span>
                  {hasProgress && (
                    <span className="inline-flex items-center gap-1 text-[#2f7d4c]">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
                      {item.stats.practicedLines}/{item.stats.totalLines} {t('conversation.list.practiced', 'practiced')}
                    </span>
                  )}
                </div>

                {hasProgress && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#5a6d62]">
                      <span>{t('conversation.list.progress', 'Progress')}</span>
                      <span>{Math.round(completionPercent)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#dfe8d8]">
                      <div
                        className="h-full rounded-full bg-[#2f7d4c] transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <span className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition group-hover:translate-x-0.5 ${
                    hasProgress ? 'bg-[#bd6a0f] text-white' : 'border border-[#bd6a0f] bg-white/70 text-[#a45a0c]'
                  }`}>
                    {actionLabel}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

DualRoleConversationCardGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    metadata: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      lineCount: PropTypes.number.isRequired,
      difficulty: PropTypes.number.isRequired,
      beatsCount: PropTypes.number.isRequired
    }).isRequired,
    stats: PropTypes.shape({
      practicedLines: PropTypes.number.isRequired,
      totalLines: PropTypes.number.isRequired,
      completionRate: PropTypes.number.isRequired
    }).isRequired
  })).isRequired,
  onSelect: PropTypes.func,
  className: PropTypes.string
};
