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

export default function HomeLearningPath({ currentStage }) {
  const items = getLearningPathItems(currentStage);

  return (
    <section className="scenic-panel scenic-path-card">
      <h2>Your Learning Path</h2>
      <div className="scenic-path-card__track" aria-label="Letters to words to reading to conversation">
        {items.map((item, index) => (
          <React.Fragment key={item.stage}>
            {index > 0 && <span className={`scenic-path-card__connector scenic-path-card__connector--${item.state}`} aria-hidden="true" />}
            <div className={`scenic-path-node scenic-path-node--${item.state}`}>
              <div className="scenic-path-node__icon">
                <Icon filled={item.state !== 'upcoming'}>{item.icon}</Icon>
              </div>
              <strong>{item.label}</strong>
              <small>{item.status}</small>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
