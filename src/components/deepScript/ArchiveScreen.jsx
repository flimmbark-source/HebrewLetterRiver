import React, { useState } from 'react';
import { ARCHIVE_REWARDS } from '../../data/deepScript/roomGenerator.js';
import { allDeepScriptLetters, getLetterPoolForWords } from '../../data/deepScript/words.js';
import RunStatusBar from './RunStatusBar.jsx';

export default function ArchiveScreen({ room, runState, onComplete }) {
  const [collected, setCollected] = useState(false);
  const reward = ARCHIVE_REWARDS.find(r => r.id === room.rewardId) || ARCHIVE_REWARDS[0];

  // For free-letter reward, show a random useful letter
  const bonusLetter = allDeepScriptLetters[Math.floor(Math.random() * allDeepScriptLetters.length)];

  const handleCollect = () => {
    setCollected(true);
    setTimeout(() => onComplete(reward.id), 800);
  };

  return (
    <div className="ds-screen ds-archive">
      <RunStatusBar runState={runState} />

      <div className="ds-archive-content">
        <div className="ds-archive-icon">{reward.icon}</div>
        <h2 className="ds-archive-title">Archive Chamber</h2>
        <p className="ds-archive-desc">{reward.description}</p>

        {reward.id === 'free-letter' && (
          <div className="ds-archive-letter" dir="rtl">
            <span className="ds-archive-letter-char">{bonusLetter}</span>
            <span className="ds-archive-letter-label">Added to your next combat</span>
          </div>
        )}

        {reward.id === 'insight' && (
          <div className="ds-archive-insight">
            <p>You study the ancient texts and gain understanding of letter patterns.</p>
          </div>
        )}

        <button
          type="button"
          className={`ds-primary-btn ds-primary-btn--active ${collected ? 'ds-primary-btn--done' : ''}`}
          onClick={handleCollect}
          disabled={collected}
        >
          {collected ? 'Collected' : 'Collect'}
        </button>
      </div>
    </div>
  );
}
