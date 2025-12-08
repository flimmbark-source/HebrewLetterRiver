import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';

export default function SettingsView() {
  const { t } = useLocalization();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();

  // Game accessibility settings - these mirror the game settings
  const [showIntroductions, setShowIntroductions] = useState(true);
  const [showWordRiverTutorial, setShowWordRiverTutorial] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [randomLetters, setRandomLetters] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(17);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setShowIntroductions(settings.showIntroductions ?? true);
        setShowWordRiverTutorial(settings.showWordRiverTutorial ?? true);
        setHighContrast(settings.highContrast ?? false);
        setRandomLetters(settings.randomLetters ?? false);
        setReducedMotion(settings.reducedMotion ?? false);
        setGameSpeed(settings.gameSpeed ?? 17);
      }
    } catch (e) {
      console.error('Failed to load game settings', e);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings = {
        showIntroductions,
        showWordRiverTutorial,
        highContrast,
        randomLetters,
        reducedMotion,
        gameSpeed
      };
      localStorage.setItem('gameSettings', JSON.stringify(settings));

      // Apply high contrast to body
      if (highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    } catch (e) {
      console.error('Failed to save game settings', e);
    }
  }, [showIntroductions, showWordRiverTutorial, highContrast, randomLetters, reducedMotion, gameSpeed]);

  const getSpeedLabel = (speed) => {
    if (speed < 14) return t('game.accessibility.speedSlow');
    if (speed > 20) return t('game.accessibility.speedFast');
    return t('game.accessibility.speedNormal');
  };

  return (
    <>
      {/* Language Settings */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <div className="wood-header">{t('settings.languageSettings')}</div>
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
                {getFormattedLanguageName(option, t)}
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
                {getFormattedLanguageName(option, t)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-arcade-text-muted">
            {t('home.languagePicker.helper')}
          </p>
        </div>
      </section>

      {/* Game Accessibility Settings */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <div className="wood-header">{t('settings.gameSettings')}</div>
          </div>
        </div>

        <div className="progress-card-small p-4">
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-arcade-text-main">{t('game.accessibility.showIntroductions')}</span>
              <input
                id="settings-toggle-introductions"
                type="checkbox"
                checked={showIntroductions}
                onChange={(e) => setShowIntroductions(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-arcade-text-main">{t('game.accessibility.wordRiverTutorial')}</span>
              <input
                id="settings-word-river-tutorial-toggle"
                type="checkbox"
                checked={showWordRiverTutorial}
                onChange={(e) => setShowWordRiverTutorial(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-arcade-text-main">{t('game.accessibility.highContrast')}</span>
              <input
                id="settings-high-contrast-toggle"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-arcade-text-main">{t('game.accessibility.randomLetters')}</span>
              <input
                id="settings-random-letters-toggle"
                type="checkbox"
                checked={randomLetters}
                onChange={(e) => setRandomLetters(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-arcade-text-main">{t('game.accessibility.reducedMotion')}</span>
              <input
                id="settings-reduced-motion-toggle"
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <div>
              <label htmlFor="settings-game-speed-slider" className="block text-sm text-arcade-text-main mb-2">
                {t('game.accessibility.speed')} (<span id="settings-speed-label">{getSpeedLabel(gameSpeed)}</span>)
              </label>
              <input
                id="settings-game-speed-slider"
                type="range"
                min="10"
                max="24"
                value={gameSpeed}
                onChange={(e) => setGameSpeed(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-arcade-panel-border rounded-lg appearance-none cursor-pointer accent-arcade-accent-orange"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
