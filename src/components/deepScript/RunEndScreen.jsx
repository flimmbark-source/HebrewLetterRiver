import React from 'react';
import { getWordById } from '../../data/deepScript/words.js';

export default function RunEndScreen({ result, runState, onRestart, onBack }) {
  const isVictory = result === 'victory';

  return (
    <div className="ds-screen ds-run-end">
      <div className={`ds-end-banner ${isVictory ? 'ds-end-banner--victory' : 'ds-end-banner--defeat'}`}>
        <div className="ds-end-icon">{isVictory ? '🏆' : '💀'}</div>
        <h1 className="ds-end-title">
          {isVictory ? 'Archive Cleared!' : 'Run Ended'}
        </h1>
        <p className="ds-end-subtitle">
          {isVictory
            ? 'The guardian has been defeated. The deep script is yours.'
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
        <div className="ds-end-stat">
          <span className="ds-end-stat-value">{runState.kit.icon} {runState.kit.name}</span>
          <span className="ds-end-stat-label">Class</span>
        </div>
      </div>

      {runState.wordsCompleted.length > 0 && (
        <div className="ds-end-words">
          <h3 className="ds-end-words-title">Words Learned</h3>
          <div className="ds-end-word-list" dir="rtl">
            {runState.wordsCompleted.map(wId => {
              const w = getWordById(wId);
              return w ? (
                <span key={wId} className="ds-end-word-tag">
                  {w.hebrew}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="ds-end-actions">
        <button type="button" className="ds-primary-btn ds-primary-btn--active" onClick={onRestart}>
          New Expedition
        </button>
        <button type="button" className="ds-secondary-btn" onClick={onBack}>
          Return to Bridge
        </button>
      </div>
    </div>
  );
}
