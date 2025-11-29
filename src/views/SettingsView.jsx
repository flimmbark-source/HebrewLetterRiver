import React from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function SettingsView() {
  const { t } = useLocalization();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();

  return (
    <>
      <header className="hero-card">
        <h1 className="hero-title">{t('app.languagePicker.label')}</h1>
        <p className="hero-body">
          <span>Accessibility Settings</span>
        </p>
      </header>

      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <div className="wood-header">Language Settings</div>
          </div>
        </div>

        <div className="progress-card-small p-4">
          <h3 className="mb-3 font-heading text-sm font-bold text-arcade-text-main">
            {t('app.languagePicker.label')}
          </h3>
          <select
            id="settings-app-language-select"
            value={appLanguageId}
            onChange={(event) => selectAppLanguage(event.target.value)}
            className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
          >
            {languageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-arcade-text-muted">
            {t('app.languagePicker.helper')}
          </p>
        </div>

        <div className="progress-card-small p-4 mt-3">
          <h3 className="mb-3 font-heading text-sm font-bold text-arcade-text-main">
            {t('home.languagePicker.label')}
          </h3>
          <select
            id="settings-practice-language-select"
            value={languageId}
            onChange={(event) => selectLanguage(event.target.value)}
            className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
          >
            {languageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-arcade-text-muted">
            {t('home.languagePicker.helper')}
          </p>
        </div>
      </section>
    </>
  );
}
