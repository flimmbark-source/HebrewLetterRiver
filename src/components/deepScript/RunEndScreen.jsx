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
}) {
  const isVictory = result === 'victory';

  return (
    <div className="ds-screen ds-run-end">
      <div className={`ds-end-banner ${isVictory ? 'ds-end-banner--victory' : 'ds-end-banner--defeat'}`}>
        <div className="ds-end-icon">{isVictory ? '🏆' : '💀'}</div>
        <h1 className="ds-end-title">
          {isVictory ? `Floor ${floorNumber} Cleared!` : 'Run Ended'}
        </h1>
        <p className="ds-end-subtitle">
          {isVictory
            ? canAdvanceFloor
              ? 'The guardian has fallen. Descend to the next floor or return to the bridge.'
              : 'The guardian has fallen. This pack expedition is complete.'
            : 'The archive claimed another seeker...'}
        </p>
      </div>

      <div className="ds-end-stats">
        <div className="ds-end-stat">
          <span className="ds-end-stat-value">{runState.combatsWon}</span>
          <span className="ds-end-stat-label">Words Defeated</span>
        </div>
        <div className="ds-end-stat">
          <span className="ds-end-stat-value">{runState.roomsCompleted}</span>
          <span className="ds-end-stat-label">Rooms Explored</span>
        </div>
      </div>

      {runState.wordsCompleted.length > 0 && (
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
          canAdvanceFloor ? (
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
