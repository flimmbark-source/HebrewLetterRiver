import React from 'react';

export default function RunStatusBar({ runState }) {
  if (!runState) return null;

  const healthPips = [];
  for (let i = 0; i < runState.maxHealth; i++) {
    healthPips.push(
      <span
        key={i}
        className={`ds-health-pip ${i < runState.health ? 'ds-health-pip--full' : 'ds-health-pip--empty'}`}
      >
        {i < runState.health ? '♥' : '♡'}
      </span>
    );
  }

  return (
    <div className="ds-status-bar">
      <div className="ds-status-health">
        {healthPips}
      </div>
      <div className="ds-status-kit">
        <span className="ds-status-kit-icon">{runState.kit.icon}</span>
        <span className="ds-status-kit-name">{runState.kit.name}</span>
      </div>
      <div className="ds-status-progress">
        {runState.combatsWon} won
      </div>
    </div>
  );
}
