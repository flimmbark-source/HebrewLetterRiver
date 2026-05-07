import React from 'react';
import { HOME_ASSETS } from './homeAssets.js';

function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function ScenicHomeHero({ streakDays = 0, learningLabel, onProfileClick }) {
  return (
    <section
      className="scenic-home-hero"
      style={{ backgroundImage: `url(${HOME_ASSETS.heroRiverValley})` }}
    >
      <div className="scenic-home-hero__topbar">
        <div className="scenic-home-hero__brand" aria-label="Letter River">
          <Icon filled>waves</Icon>
          <span>Letter River</span>
        </div>

        <div className="scenic-home-hero__actions">
          <div className="scenic-home-hero__streak" aria-label={`${streakDays} day streak`}>
            <Icon filled>local_fire_department</Icon>
            <span>{streakDays}</span>
          </div>
          <button
            type="button"
            className="scenic-home-hero__profile btn-press"
            onClick={onProfileClick}
            aria-label="Edit profile"
          >
            <Icon filled>person</Icon>
          </button>
        </div>
      </div>

      <div className="scenic-home-hero__copy">
        <p className="scenic-home-hero__eyebrow">{learningLabel}</p>
        <h1>Good morning, Explorer!</h1>
        <p className="scenic-home-hero__subtitle">Keep your river flowing.</p>
      </div>
    </section>
  );
}
