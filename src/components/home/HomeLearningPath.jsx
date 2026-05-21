import React from 'react';
import Icon from '../Icon.jsx';
import { getLearningPathItems } from './homeState.js';

export default function HomeLearningPath({ currentStage, selectedStage, onSelectStage, t }) {
  const items = getLearningPathItems(currentStage, selectedStage, t);

  return (
    <section className="scenic-panel scenic-path-card">
      <h2>{t('home.scenic.pathTitle', 'Your Learning Path')}</h2>
      <div className="scenic-path-card__track" aria-label={t('home.scenic.pathAria', 'Letters to words to Deep Script to conversation')}>
        {items.map((item, index) => (
          <React.Fragment key={item.stage}>
            {index > 0 && <span className={`scenic-path-card__connector scenic-path-card__connector--${item.state}`} aria-hidden="true" />}
            <button
              type="button"
              className={`scenic-path-node scenic-path-node--${item.state} ${item.isSelected ? 'scenic-path-node--selected' : ''}`}
              onClick={() => onSelectStage?.(item.stage)}
              aria-pressed={item.isSelected}
              aria-label={item.ariaLabel}
              title={item.status}
            >
              <div className="scenic-path-node__icon">
                <Icon name={item.icon} size={24} filled={item.state !== 'upcoming' || item.isSelected} />
              </div>
              <strong>{item.label}</strong>
            </button>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
