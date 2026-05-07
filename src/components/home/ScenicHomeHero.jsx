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

function CompactLanguageSelect({ id, label, value, options, onChange, icon }) {
  const selectedName = options.find((option) => option.id === value)?.name ?? value;

  return (
    <label className="scenic-language-select" htmlFor={id}>
      <span className="scenic-language-select__icon" aria-hidden="true">{icon}</span>
      <span className="scenic-language-select__text">
        <small>{label}</small>
        <strong>{selectedName}</strong>
      </span>
      <Icon className="scenic-language-select__chevron">expand_more</Icon>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ScenicHomeHero({
  streakDays = 0,
  onProfileClick,
  appLanguageId,
  practiceLanguageId,
  appLanguageOptions,
  practiceLanguageOptions,
  onAppLanguageChange,
  onPracticeLanguageChange,
  t
}) {
  return (
    <section
      className="scenic-home-hero"
      style={{ backgroundImage: `url(${HOME_ASSETS.heroRiverValley})` }}
    >
      <div className="scenic-home-hero__topbar">
        <div className="scenic-home-hero__brand" aria-label={t('home.scenic.brand', 'Letter River')}>
          <Icon filled>waves</Icon>
          <span>{t('home.scenic.brand', 'Letter River')}</span>
        </div>

        <div className="scenic-home-hero__actions">
          <div
            className="scenic-home-hero__streak"
            aria-label={t('home.scenic.streakAria', '{{count}} day streak', { count: streakDays })}
          >
            <Icon filled>local_fire_department</Icon>
            <span>{streakDays}</span>
          </div>
          <button
            type="button"
            className="scenic-home-hero__profile btn-press"
            onClick={onProfileClick}
            aria-label={t('home.scenic.profileAria', 'Edit profile')}
          >
            <Icon filled>person</Icon>
          </button>
        </div>
      </div>

      <div className="scenic-home-hero__copy">
        <div className="scenic-language-row" aria-label={t('home.scenic.languageSettings', 'Language settings')}>
          <CompactLanguageSelect
            id="home-scenic-app-language"
            label={t('home.scenic.appLanguage', 'App')}
            value={appLanguageId}
            options={appLanguageOptions}
            onChange={onAppLanguageChange}
            icon="🌐"
          />
          <CompactLanguageSelect
            id="home-scenic-practice-language"
            label={t('home.scenic.practiceLanguage', 'Learning')}
            value={practiceLanguageId}
            options={practiceLanguageOptions}
            onChange={onPracticeLanguageChange}
            icon="🌊"
          />
        </div>
        <h1>{t('home.scenic.greeting', 'Good morning, Explorer!')}</h1>
        <p className="scenic-home-hero__subtitle">{t('home.scenic.subtitle', 'Keep your river flowing.')}</p>
      </div>
    </section>
  );
}
