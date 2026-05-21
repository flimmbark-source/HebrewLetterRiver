import React from 'react';
import LetterRiverBrand from '../LetterRiverBrand.jsx';
import Icon from '../Icon.jsx';
import { HOME_ASSETS } from './homeAssets.js';

function CompactLanguageSelect({ id, label, value, options, onChange, icon }) {
  const selectedName = options.find((option) => option.id === value)?.name ?? value;

  return (
    <label className="scenic-language-select" htmlFor={id}>
      <span className="scenic-language-select__icon" aria-hidden="true">{icon}</span>
      <span className="scenic-language-select__text">
        <small>{label}</small>
        <strong>{selectedName}</strong>
      </span>
      <Icon name="chevron_right" className="scenic-language-select__chevron" size={18} />
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
  const brandLabel = t('home.scenic.brand', 'Letter River');

  return (
    <section
      className="scenic-home-hero"
      style={{ backgroundImage: `url(${HOME_ASSETS.heroRiverValley})` }}
    >
      <div className="scenic-home-hero__topbar">
        <LetterRiverBrand
          label={brandLabel}
          className="scenic-home-hero__brand"
        />

        <div className="scenic-home-hero__actions">
          <div
            className="scenic-home-hero__streak"
            aria-label={t('home.scenic.streakAria', '{{count}} day streak', { count: streakDays })}
          >
            <Icon name="local_fire_department" size={23} filled />
            <span>{streakDays}</span>
          </div>
          <button
            type="button"
            className="scenic-home-hero__profile btn-press"
            onClick={onProfileClick}
            aria-label={t('home.scenic.profileAria', 'Edit profile')}
          >
            <Icon name="person" size={23} filled />
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
      </div>
    </section>
  );
}
