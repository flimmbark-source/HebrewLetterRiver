import React, { useMemo } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';

/**
 * Post-Game Review Screen
 * Shows session statistics, missed letters, and SRS level-ups
 *
 * @param {Object} props
 * @param {Object} props.sessionData - Game session data
 * @param {number} props.sessionData.score - Final score
 * @param {Object} props.sessionData.stats - Per-letter stats {itemId: {correct, incorrect}}
 * @param {number} props.sessionData.lives - Hearts remaining
 * @param {number} props.sessionData.level - Level reached
 * @param {Function} props.onPlayAgain - Callback for play again button
 * @param {Function} props.onHome - Callback for home button
 */
export default function PostGameReview({
  sessionData,
  onPlayAgain,
  onHome
}) {
  const { languagePack, t } = useLocalization();
  const { getItemMaturity, progress, MATURITY } = useSRS();

  // Calculate session statistics
  const sessionStats = useMemo(() => {
    const stats = sessionData?.stats || {};
    const itemIds = Object.keys(stats);

    let totalCorrect = 0;
    let totalIncorrect = 0;
    const missedLetters = [];
    const practicedLetters = [];

    itemIds.forEach(itemId => {
      const itemStats = stats[itemId];
      totalCorrect += itemStats.correct || 0;
      totalIncorrect += itemStats.incorrect || 0;

      const item = languagePack.itemsById?.[itemId] || languagePack.itemsBySymbol?.[itemId];
      if (item) {
        practicedLetters.push({
          id: itemId,
          symbol: item.symbol || itemId,
          name: item.name || '',
          sound: item.sound || '',
          correct: itemStats.correct || 0,
          incorrect: itemStats.incorrect || 0
        });

        if (itemStats.incorrect > 0) {
          missedLetters.push({
            id: itemId,
            symbol: item.symbol || itemId,
            name: item.name || '',
            sound: item.sound || '',
            incorrectCount: itemStats.incorrect
          });
        }
      }
    });

    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return {
      totalLetters: itemIds.length,
      totalCorrect,
      totalIncorrect,
      accuracy,
      missedLetters,
      practicedLetters
    };
  }, [sessionData, languagePack]);

  // Find letters that leveled up in SRS
  const leveledUpLetters = useMemo(() => {
    const leveled = [];

    sessionStats.practicedLetters.forEach(letter => {
      const maturity = getItemMaturity(letter.id, 'letter');
      const srsItem = progress.letters?.[letter.id];

      // Consider it "leveled up" if it's in learning or higher and was reviewed this session
      if (srsItem && maturity && maturity !== MATURITY.NEW) {
        leveled.push({
          ...letter,
          maturity,
          interval: srsItem.interval,
          nextReviewDays: Math.ceil((srsItem.dueDate - Date.now()) / (24 * 60 * 60 * 1000))
        });
      }
    });

    return leveled;
  }, [sessionStats.practicedLetters, getItemMaturity, progress, MATURITY]);

  const heartsRemaining = sessionData?.lives ?? 0;
  const finalScore = sessionData?.score ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #fffaf0 0%, #ffe9c9 100%)'
    }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #fff9eb 0%, #ffe5bd 100%)',
          border: '2px solid #e49b5a'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎯</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4a2208' }}>
            {t('postGame.title', 'Session Complete!')}
          </h2>
          <p className="text-lg" style={{ color: '#6c3b14' }}>
            {t('postGame.subtitle', 'Great work! Here\'s how you did:')}
          </p>
        </div>

        {/* Session Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon="📝"
            label={t('postGame.stats.lettersLabel', 'Letters')}
            value={sessionStats.totalLetters}
            color="#ff9247"
          />
          <StatCard
            icon="🎯"
            label={t('postGame.stats.accuracyLabel', 'Accuracy')}
            value={`${sessionStats.accuracy}%`}
            color="#10B981"
          />
          <StatCard
            icon="⭐"
            label={t('postGame.stats.scoreLabel', 'Score')}
            value={finalScore}
            color="#ffce4a"
          />
          <StatCard
            icon="❤️"
            label={t('postGame.stats.heartsLabel', 'Hearts')}
            value={heartsRemaining}
            color="#ef4444"
          />
        </div>

        {/* Missed Letters Section */}
        {sessionStats.missedLetters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 flex items-center" style={{ color: '#4a2208' }}>
              <span className="mr-2">⚠️</span>
              {t('postGame.missed.title', 'Letters to Review')}
            </h3>
            <div
              className="rounded-2xl p-4 mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '2px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {sessionStats.missedLetters.map(letter => (
                  <div
                    key={letter.id}
                    className="flex flex-col items-center p-2 rounded-xl"
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca'
                    }}
                  >
                    <div className="text-3xl mb-1">{letter.symbol}</div>
                    <div className="text-xs font-semibold text-center" style={{ color: '#6c3b14' }}>
                      {letter.name}
                    </div>
                    <div className="text-xs text-red-600 font-bold">
                      ×{letter.incorrectCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm" style={{ color: '#6c3b14' }}>
              💡 {t('postGame.missed.hint', 'These letters will appear more often in your next session!')}
            </p>
          </div>
        )}

        {/* SRS Level-Ups */}
        {leveledUpLetters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 flex items-center" style={{ color: '#4a2208' }}>
              <span className="mr-2">📈</span>
              {t('postGame.levelUp.title', 'Progress Update')}
            </h3>
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="space-y-2">
                {leveledUpLetters.slice(0, 5).map(letter => {
                  const maturityLabel = {
                    [MATURITY.LEARNING]: t('srs.maturity.learning', 'Learning'),
                    [MATURITY.YOUNG]: t('srs.maturity.young', 'Young'),
                    [MATURITY.MATURE]: t('srs.maturity.mature', 'Mature')
                  }[letter.maturity] || letter.maturity;

                  return (
                    <div
                      key={letter.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'white' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{letter.symbol}</div>
                        <div>
                          <div className="font-semibold" style={{ color: '#4a2208' }}>
                            {letter.name}
                          </div>
                          <div className="text-xs" style={{ color: '#6c3b14' }}>
                            {maturityLabel} • {t('postGame.levelUp.nextReview', 'Review in')} {letter.nextReviewDays} {letter.nextReviewDays === 1 ? t('common.day', 'day') : t('common.days', 'days')}
                          </div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">✓</div>
                    </div>
                  );
                })}
              </div>
              {leveledUpLetters.length > 5 && (
                <p className="text-xs text-center mt-3" style={{ color: '#6c3b14' }}>
                  {t('postGame.levelUp.more', '+{count} more letters updated', { count: leveledUpLetters.length - 5 })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-full px-6 py-4 text-lg font-bold transition-all active:translate-y-1 relative"
            style={{
              background: 'linear-gradient(135deg, #e8ffd8 0%, #7bd74f 100%)',
              color: '#1a5a1a',
              boxShadow: '0 3px 0 #4a9b2f, 0 6px 10px rgba(74, 155, 47, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #4a9b2f, 0 4px 10px rgba(74, 155, 47, 0.4)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 3px 0 #4a9b2f, 0 6px 10px rgba(74, 155, 47, 0.4)';
            }}
          >
            🔄 {t('postGame.actions.playAgain', 'Play Again')}
          </button>

          <button
            onClick={onHome}
            className="flex-1 rounded-full px-6 py-4 text-lg font-bold transition-all active:translate-y-1 relative"
            style={{
              background: 'radial-gradient(circle at 20% 0, #fff7cf 0%, #ffd96d 45%, #e79b26 100%)',
              color: '#4a2208',
              boxShadow: '0 3px 0 #c07a1c, 0 6px 10px rgba(192, 122, 28, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #c07a1c, 0 4px 10px rgba(192, 122, 28, 0.4)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 3px 0 #c07a1c, 0 6px 10px rgba(192, 122, 28, 0.4)';
            }}
          >
            🏠 {t('postGame.actions.home', 'Home')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        background: 'white',
        border: '2px solid rgba(228, 155, 90, 0.3)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6c3b14' }}>
        {label}
      </div>
    </div>
  );
}
