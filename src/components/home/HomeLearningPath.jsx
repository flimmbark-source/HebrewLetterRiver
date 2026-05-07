import React from 'react';
import { getLearningPathItems } from './homeState.js';

function Icon({ children, filled = false }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function HomeLearningPath({ currentStage, selectedStage, onSelectStage }) {
  const items = getLearningPathItems(currentStage, selectedStage);

  return (
    <section className="scenic-panel scenic-path-card">
      <h2>Your Learning Path</h2>
      <div className="scenic-path-card__track" aria-label="Letters to words to reading to conversation">
        {items.map((item, index) => (
          <React.Fragment key={item.stage}>
            {index > 0 && <span className={`scenic-path-card__connector scenic-path-card__connector--${item.state}`} aria-hidden="true" />}
            <button
              type="button"
              className={`scenic-path-node scenic-path-node--${item.state} ${item.isSelected ? 'scenic-path-node--selected' : ''}`}
              onClick={() => onSelectStage?.(item.stage)}
              aria-pressed={item.isSelected}
              aria-label={`Show ${item.label} progress, ${item.status}`}
            >
              <div className="scenic-path-node__icon">
                <Icon filled={item.state !== 'upcoming' || item.isSelected}>{item.icon}</Icon>
              </div>
              <strong>{item.label}</strong>
              <small>{item.isSelected ? 'Selected' : item.status}</small>
            </button>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
