import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';

function Icon({ children, className = '', filled = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`, ...style }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function DailyReviewCard() {
  const { getWeakestLetter } = useProgress();
  const { getDueItems, isLoading } = useSRS();
  const { setShowPlayModal } = useGame();
  const { t } = useLocalization();

  const dueLetters = useMemo(() => {
    if (isLoading) return [];
    try {
      return getDueItems('letter', 50);
    } catch {
      return [];
    }
  }, [getDueItems, isLoading]);

  const dueVocab = useMemo(() => {
    if (isLoading) return [];
    try {
      return getDueItems('vocabulary', 50);
    } catch {
      return [];
    }
  }, [getDueItems, isLoading]);

  const weakestLetter = useMemo(() => {
    try {
      return getWeakestLetter();
    } catch {
      return null;
    }
  }, [getWeakestLetter]);

  const dueLetterCount = dueLetters.length;
  const dueVocabCount = dueVocab.length;
  const totalDue = dueLetterCount + dueVocabCount;
  const allCaughtUp = totalDue === 0;

  if (isLoading) return null;

  return (
    <div className="card-elevated overflow-hidden rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: 'var(--app-muted)' }}
        >
          {t('dailyReview.title', 'Daily Review')}
        </h3>
        <Icon
          className="text-lg"
          style={{ color: allCaughtUp ? '#22c55e' : 'var(--app-primary)' }}
          filled={allCaughtUp}
        >
          {allCaughtUp ? 'check_circle' : 'assignment'}
        </Icon>
      </div>

      {allCaughtUp ? (
        <div className="flex items-center gap-3 py-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <Icon className="text-xl" filled style={{ color: '#22c55e' }}>done_all</Icon>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>
              {t('dailyReview.allCaughtUp', 'All caught up!')}
            </p>
            <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
              {t('dailyReview.checkBackTomorrow', 'Great work. Check back tomorrow.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {dueLetterCount > 0 && (
            <button
              type="button"
              onClick={() => setShowPlayModal(true)}
              className="btn-press flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all"
              style={{
                background: 'var(--app-mode-river-surface)',
                border: '1px solid var(--app-mode-river-bg)'
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: 'var(--app-mode-river-bg)' }}
              >
                <Icon className="text-lg" style={{ color: 'var(--app-mode-river)' }}>waves</Icon>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>
                  {t(
                    dueLetterCount === 1 ? 'dailyReview.lettersDue_one' : 'dailyReview.lettersDue_other',
                    dueLetterCount === 1 ? '{{count}} letter due for review' : '{{count}} letters due for review',
                    { count: dueLetterCount }
                  )}
                </p>
                {weakestLetter?.hebrew && weakestLetter?.name && (
                  <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                    {t('dailyReview.focusOn', 'Focus on: {{symbol}} ({{name}})', {
                      symbol: weakestLetter.hebrew,
                      name: weakestLetter.name
                    })}
                  </p>
                )}
              </div>
              <Icon className="text-base" style={{ color: 'var(--app-mode-river)' }}>
                arrow_forward
              </Icon>
            </button>
          )}

          {dueVocabCount > 0 && (
            <button
              type="button"
              onClick={() => setShowPlayModal(true)}
              className="btn-press flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all"
              style={{
                background: 'var(--app-mode-bridge-surface)',
                border: '1px solid var(--app-mode-bridge-bg)'
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: 'var(--app-mode-bridge-bg)' }}
              >
                <Icon className="text-lg" style={{ color: 'var(--app-mode-bridge)' }}>extension</Icon>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>
                  {t(
                    dueVocabCount === 1 ? 'dailyReview.wordsDue_one' : 'dailyReview.wordsDue_other',
                    dueVocabCount === 1 ? '{{count}} word to practice' : '{{count}} words to practice',
                    { count: dueVocabCount }
                  )}
                </p>
              </div>
              <Icon className="text-base" style={{ color: 'var(--app-mode-bridge)' }}>
                arrow_forward
              </Icon>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
