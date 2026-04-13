import React from 'react';
import { getWordById } from '../../data/deepScript/words.js';
import { getNativeScript, getTextDirection } from '../../lib/vocabLanguageAdapter.js';

export default function RunEndScreen({
  result,
  runState,
  floorNumber,
  onNextFloor,
  onRestart,
  onBack,
  canAdvanceFloor = true,
  isSentenceMode = false,
}) {
  const isVictory = result === 'victory';

  const getTitle = () => {
    if (isSentenceMode) {
      return isVictory ? 'Expedition Complete!' : 'Run Ended';
    }
    return isVictory ? `Floor ${floorNumber} Cleared!` : 'Run Ended';
  };

  const getSubtitle = () => {
    if (isSentenceMode) {
      return isVictory
        ? 'All sentences conquered. Well done!'
        : 'The sentences proved too challenging...';
    }
    if (isVictory) {
      return canAdvanceFloor
        ? 'The guardian has fallen. Descend to the next floor or return to the bridge.'
        : 'The guardian has fallen. This pack expedition is complete.';
    }
    return 'The archive claimed another seeker...';
  };

  return (
    <div className="ds-screen ds-run-end">
      <div className={`ds-end-banner ${isVictory ? 'ds-end-banner--victory' : 'ds-end-banner--defeat'}`}>
        <div className="ds-end-icon">{isVictory ? '🏆' : '💀'}</div>
        <h1 className="ds-end-title">{getTitle()}</h1>
        <p className="ds-end-subtitle">{getSubtitle()}</p>
      </div>

      <div className="ds-end-stats">
        <div className="ds-end-stat">
          <span className="ds-end-stat-value">{runState.combatsWon}</span>
          <span className="ds-end-stat-label">
            {isSentenceMode ? 'Sentences Built' : 'Words Defeated'}
          </span>
        </div>
        <div className="ds-end-stat">
          <span className="ds-end-stat-value">{runState.roomsCompleted}</span>
          <span className="ds-end-stat-label">
            {isSentenceMode ? 'Encounters Cleared' : 'Rooms Explored'}
          </span>
        </div>
      </div>

      {!isSentenceMode && runState.wordsCompleted.length > 0 && (
        <div className="ds-end-words">
          <h3 className="ds-end-words-title">Words Learned</h3>
          <div className="ds-end-word-list" dir={getTextDirection(runState.wordsCompleted[0] ? (getWordById(runState.wordsCompleted[0])?.languageId || 'hebrew') : 'hebrew')}>
            {runState.wordsCompleted.map(wId => {
              const w = getWordById(wId);
              return w ? (
                <span key={wId} className="ds-end-word-tag">
                  {getNativeScript(w)}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="ds-end-actions">
        {isVictory ? (
          canAdvanceFloor && !isSentenceMode ? (
            <button type="button" className="ds-primary-btn ds-primary-btn--active" onClick={onNextFloor}>
              Next Floor
            </button>
          ) : (
            <button type="button" className="ds-primary-btn ds-primary-btn--active" onClick={onRestart}>
              New Expedition
            </button>
          )
        ) : (
          <button type="button" className="ds-primary-btn ds-primary-btn--active" onClick={onRestart}>
            New Expedition
          </button>
        )}
        <button type="button" className="ds-secondary-btn" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
