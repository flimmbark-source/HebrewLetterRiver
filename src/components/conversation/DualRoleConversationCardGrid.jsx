import PropTypes from 'prop-types';
import { useLocalization } from '../../context/LocalizationContext.jsx';

const getDifficultyColor = (difficulty) => {
  if (difficulty <= 2) return 'text-emerald-400';
  if (difficulty <= 3) return 'text-blue-400';
  if (difficulty <= 4) return 'text-amber-400';
  return 'text-red-400';
};

const difficultyStars = (difficulty) => {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
};

export default function DualRoleConversationCardGrid({ items, onSelect, className = '' }) {
  const { t } = useLocalization();

  return (
    <div className={`grid gap-3 sm:gap-4 ${className}`.trim()}>
      {items.map((item) => {
        const completionPercent = item.stats.completionRate * 100;
        const hasProgress = item.stats.practicedLines > 0;

        return (
          <button
            key={item.metadata.id}
            onClick={() => onSelect?.(item)}
            className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">
                  {item.metadata.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {item.metadata.subtitle}
                </p>
              </div>

              {/* Difficulty badge */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 flex-shrink-0 text-xs sm:text-sm ${getDifficultyColor(item.metadata.difficulty)}`}>
                <span>{difficultyStars(item.metadata.difficulty)}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm flex-wrap text-slate-400">
              <div className="flex items-center gap-2">
                <span>🎭</span>
                <span>
                  {item.metadata.lineCount} {t('conversation.list.phrases', 'phrases')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>
                  {item.metadata.beatsCount} {t('conversation.list.beats', 'beats')}
                </span>
              </div>
              {hasProgress && (
                <div className="flex items-center gap-2 text-blue-400">
                  <span>📊</span>
                  <span>
                    {item.stats.practicedLines}/{item.stats.totalLines} {t('conversation.list.practiced', 'practiced')}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {hasProgress && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>{t('conversation.list.progress', 'Progress')}</span>
                  <span>{Math.round(completionPercent)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            )}
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
