import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';

export default function SettingsView() {
  const { t } = useLocalization();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();

  // Game accessibility settings - these mirror the game settings
  const [showIntroductions, setShowIntroductions] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [randomLetters, setRandomLetters] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(17);
  const [gameFont, setGameFont] = useState('default');
  const [slowRiver, setSlowRiver] = useState(false);
  const [clickMode, setClickMode] = useState(false);

  // Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoPopupContent, setInfoPopupContent] = useState({ title: '', description: '' });

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setShowIntroductions(settings.showIntroductions ?? true);
        setHighContrast(settings.highContrast ?? false);
        setRandomLetters(settings.randomLetters ?? false);
        setReducedMotion(settings.reducedMotion ?? false);
        setGameSpeed(settings.gameSpeed ?? 17);
        setGameFont(settings.gameFont ?? 'default');
        setSlowRiver(settings.slowRiver ?? false);
        setClickMode(settings.clickMode ?? false);
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
        highContrast,
        randomLetters,
        reducedMotion,
        gameSpeed,
        gameFont,
        slowRiver,
        clickMode
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
  }, [showIntroductions, highContrast, randomLetters, reducedMotion, gameSpeed, gameFont, slowRiver, clickMode]);

  const getSpeedLabel = (speed) => {
    if (speed < 14) return t('game.accessibility.speedSlow');
    if (speed > 20) return t('game.accessibility.speedFast');
    return t('game.accessibility.speedNormal');
  };

  // Setting descriptions for info popup
  const settingInfo = {
    showIntroductions: {
      title: t('game.accessibility.showIntroductions'),
      description: 'Shows an introduction screen for each new letter before it appears in the game, helping you learn the letter before playing.'
    },
    highContrast: {
      title: t('game.accessibility.highContrast'),
      description: 'Increases the contrast between text and background colors to make letters easier to see and distinguish.'
    },
    randomLetters: {
      title: t('game.accessibility.randomLetters'),
      description: 'Letters appear in random order instead of the standard alphabetical sequence, providing varied practice.'
    },
    reducedMotion: {
      title: t('game.accessibility.reducedMotion'),
      description: 'Simplifies animations by removing rotation and complex movement patterns, making letters move in straight lines for easier tracking.'
    },
    gameSpeed: {
      title: t('game.accessibility.speed'),
      description: 'Controls how quickly letters move across the screen. Slower speeds give you more time to recognize and drag letters.'
    },
    gameFont: {
      title: 'Game Font',
      description: 'Choose from different fonts including dyslexia-friendly options. Some fonts are specially designed to make letters easier to distinguish.'
    },
    slowRiver: {
      title: 'Slow River Mode',
      description: 'Letters move to the center of the screen and stay there instead of flowing off the edge. This gives you unlimited time to identify and place each letter.'
    },
    clickMode: {
      title: 'Click Mode',
      description: 'Click on a letter to select it, then click on a bucket to place it, instead of dragging. This makes the game easier to play if you have difficulty with dragging.'
    }
  };

  const showInfo = (settingKey) => {
    if (settingInfo[settingKey]) {
      setInfoPopupContent(settingInfo[settingKey]);
      setShowInfoPopup(true);
    }
  };

  const fontOptions = [
    { value: 'default', label: 'Default' },
    { value: 'opendyslexic', label: 'OpenDyslexic' },
    { value: 'comic-sans', label: 'Comic Sans' },
    { value: 'arial', label: 'Arial' },
    { value: 'verdana', label: 'Verdana' }
  ];

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

        <div className="progress-card-small p-4 relative">
          {/* Info icon */}
          <div className="absolute right-3 top-3 text-arcade-text-muted text-xs">
            ⓘ {t('game.accessibility.clickForInfo') || 'Click on a setting to learn more'}
          </div>

          <div className="space-y-4 mt-2">
            {/* Font Dropdown */}
            <div className="border-b border-arcade-panel-border pb-4">
              <label htmlFor="settings-font-select" className="block text-sm text-arcade-text-main mb-2">
                <span
                  className="cursor-pointer hover:text-arcade-accent-orange"
                  onClick={() => showInfo('gameFont')}
                >
                  Game Font
                </span>
              </label>
              <select
                id="settings-font-select"
                value={gameFont}
                onChange={(e) => setGameFont(e.target.value)}
                className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
              >
                {fontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('showIntroductions')}
              >
                {t('game.accessibility.showIntroductions')}
              </span>
              <input
                id="settings-toggle-introductions"
                type="checkbox"
                checked={showIntroductions}
                onChange={(e) => setShowIntroductions(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('highContrast')}
              >
                {t('game.accessibility.highContrast')}
              </span>
              <input
                id="settings-high-contrast-toggle"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('randomLetters')}
              >
                {t('game.accessibility.randomLetters')}
              </span>
              <input
                id="settings-random-letters-toggle"
                type="checkbox"
                checked={randomLetters}
                onChange={(e) => setRandomLetters(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('reducedMotion')}
              >
                {t('game.accessibility.reducedMotion')}
              </span>
              <input
                id="settings-reduced-motion-toggle"
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('slowRiver')}
              >
                Slow River Mode
              </span>
              <input
                id="settings-slow-river-toggle"
                type="checkbox"
                checked={slowRiver}
                onChange={(e) => setSlowRiver(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <label className="flex items-center justify-between">
              <span
                className="text-sm text-arcade-text-main cursor-pointer hover:text-arcade-accent-orange"
                onClick={() => showInfo('clickMode')}
              >
                Click Mode
              </span>
              <input
                id="settings-click-mode-toggle"
                type="checkbox"
                checked={clickMode}
                onChange={(e) => setClickMode(e.target.checked)}
                className="h-5 w-5 rounded border-arcade-panel-border bg-arcade-panel-light text-arcade-accent-orange focus:ring-arcade-accent-orange"
              />
            </label>

            <div>
              <label htmlFor="settings-game-speed-slider" className="block text-sm text-arcade-text-main mb-2">
                <span
                  className="cursor-pointer hover:text-arcade-accent-orange"
                  onClick={() => showInfo('gameSpeed')}
                >
                  {t('game.accessibility.speed')} (<span id="settings-speed-label">{getSpeedLabel(gameSpeed)}</span>)
                </span>
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

      {/* Info Popup Modal */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="progress-card-small p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold text-arcade-text-main mb-3">
              {infoPopupContent.title}
            </h3>
            <p className="text-sm text-arcade-text-main mb-4">
              {infoPopupContent.description}
            </p>
            <button
              onClick={() => setShowInfoPopup(false)}
              className="w-full rounded-xl bg-arcade-accent-orange px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition"
            >
              {t('common.close') || 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
