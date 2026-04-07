import React from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import LearnView from './views/LearnView.jsx';
import BridgeBuilderView from './views/BridgeBuilderView.jsx';
import DeepScriptView from './views/DeepScriptView.jsx';
import SettingsView from './views/SettingsView.jsx';
import DailyView from './views/DailyView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { SRSProvider } from './context/SRSContext.jsx';
import { GameProvider, useGame } from './context/GameContext.jsx';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { TutorialProvider, useTutorial } from './context/TutorialContext.jsx';
import { getFormattedLanguageName } from './lib/languageUtils.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import MigrationInitializer from './components/MigrationInitializer.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import PlayModeModal from './components/PlayModeModal.jsx';
import { useFontSettings } from './hooks/useFontSettings.js';

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4.5 10.5 12 4l7.5 6.5v8a1 1 0 0 1-1 1h-4.5v-5.5h-4V19.5H5.5a1 1 0 0 1-1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M8 5.14v13.72L19 12z" fill="currentColor" />
    </svg>
  );
}

function TrophyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M18 4h2a1 1 0 0 1 1 1v2a5 5 0 0 1-4 4.9V13a2 2 0 0 1-2 2h-1v2.18A3 3 0 0 1 16 20v1H8v-1a3 3 0 0 1 2-2.82V15H9a2 2 0 0 1-2-2v-1.1A5 5 0 0 1 3 7V5a1 1 0 0 1 1-1h2V3h12zm0 2V5H6v1a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5z"
        fill="currentColor"
      />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M5 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H5zM19 4h-4a1 1 0 0 0-1 1v17a3 3 0 0 1 3-3h2a1 1 0 0 0 1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

function LanguageSelect({ selectId, value, onChange, label, helperText, selectClassName = '', options = [] }) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={selectId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border-4 border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-inner focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/40 sm:text-base ${selectClassName}`}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs font-semibold text-slate-400">{helperText}</p> : null}
    </div>
  );
}

function LanguageOnboardingModal() {
  const {
    hasSelectedLanguage,
    languageId,
    setLanguageId,
    appLanguageId,
    setAppLanguageId,
    markLanguageSelected,
    languageOptions
  } = useLanguage();
  const { t: translateOnboarding } = useLocalization();
  const { currentTutorial, currentStepIndex } = useTutorial();
  const [pendingPracticeId, setPendingPracticeId] = React.useState(languageId);
  const [pendingAppId, setPendingAppId] = React.useState(appLanguageId);

  React.useEffect(() => {
    setPendingPracticeId(languageId);
  }, [languageId]);

  React.useEffect(() => {
    setPendingAppId(appLanguageId);
  }, [appLanguageId]);

  if (hasSelectedLanguage) return null;

  // Disable continue button during tutorial until step 4 (confirmLanguages)
  const isContinueDisabled = currentTutorial?.id === 'firstTime' && currentStepIndex < 3;

  const handleChange = (nextId) => {
    setPendingPracticeId(nextId);
    setLanguageId(nextId);
  };

  const handleAppLanguageChange = (nextId) => {
    setPendingAppId(nextId);
    setAppLanguageId(nextId);
  };

  const handleContinue = () => {
    if (!isContinueDisabled) {
      markLanguageSelected();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 language-onboarding-overlay animate-fade-in" style={{
      background: 'var(--app-bg)'
    }}>
      <div className="animate-scale-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-8 language-onboarding-card" style={{
        background: 'var(--app-card-bg)',
        border: '1px solid var(--app-card-border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 className="text-2xl font-bold sm:text-3xl" style={{
          fontFamily: '"Baloo 2", system-ui, sans-serif',
          color: 'var(--app-on-surface)'
        }}>
          {translateOnboarding('app.languagePicker.onboardingTitle')}
        </h2>
        <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--app-muted)' }}>
          {translateOnboarding('app.languagePicker.onboardingSubtitle')}
        </p>
        <div className="mt-6 space-y-5 text-left">
          <div className="flex flex-col gap-2 onboarding-app-language-section">
            <label htmlFor="onboarding-app-language" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
              {translateOnboarding('app.languagePicker.label')}
            </label>
            <select
              id="onboarding-app-language"
              value={pendingAppId}
              onChange={(event) => handleAppLanguageChange(event.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm font-semibold sm:text-base onboarding-app-language-select"
              style={{
                borderColor: 'var(--app-input-border)',
                background: 'var(--app-input-bg)',
                color: 'var(--app-on-surface)'
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {getFormattedLanguageName(option, translateOnboarding)}
                </option>
              ))}
            </select>
            <p className="text-xs font-semibold" style={{ color: 'var(--app-muted)' }}>
              {translateOnboarding('app.languagePicker.helper')}
            </p>
          </div>
          <div className="flex flex-col gap-2 onboarding-practice-language-section">
            <label htmlFor="onboarding-language" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
              {translateOnboarding('app.practicePicker.label')}
            </label>
            <select
              id="onboarding-language"
              value={pendingPracticeId}
              onChange={(event) => handleChange(event.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm font-semibold sm:text-base onboarding-practice-language-select"
              style={{
                borderColor: 'var(--app-input-border)',
                background: 'var(--app-input-bg)',
                color: 'var(--app-on-surface)'
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {getFormattedLanguageName(option, translateOnboarding)}
                </option>
              ))}
            </select>
            <p className="text-xs font-semibold" style={{ color: 'var(--app-muted)' }}>
              {translateOnboarding('app.practicePicker.helper')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={isContinueDisabled}
          className="btn-cta mt-6 w-full px-5 py-3.5 text-base sm:w-auto sm:px-8 onboarding-continue-button"
          style={{
            opacity: isContinueDisabled ? 0.5 : 1,
            cursor: isContinueDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          {translateOnboarding('app.languagePicker.confirm')}
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const { openGame, closeGame, isVisible: isGameVisible, isGameRunning, showPlayModal, setShowPlayModal } = useGame();
  const { interfaceLanguagePack } = useLocalization();
  const { currentTutorial, currentStepIndex } = useTutorial();
  const fontClass = interfaceLanguagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const direction = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';
  const [inConversationPractice, setInConversationPractice] = React.useState(false);
  const [inDeepScript, setInDeepScript] = React.useState(false);
  const location = useLocation();
  const { appFontClass } = useFontSettings();

  React.useEffect(() => {
    const applyThemeFromSettings = () => {
      try {
        const saved = localStorage.getItem('gameSettings');
        const parsed = saved ? JSON.parse(saved) : {};
        const darkModeEnabled = !!(parsed.darkMode ?? parsed.highContrast ?? false);
        document.body.classList.toggle('dark-mode', darkModeEnabled);
      } catch (error) {
        console.error('Failed to apply theme from game settings', error);
      }
    };

    const handleStorage = (event) => {
      if (event.key === 'gameSettings') applyThemeFromSettings();
    };

    applyThemeFromSettings();
    window.addEventListener('gameSettingsChanged', applyThemeFromSettings);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('gameSettingsChanged', applyThemeFromSettings);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);


  // Check if we're in conversation practice or deep script mode
  React.useEffect(() => {
    const checkBodyModes = () => {
      setInConversationPractice(document.body.classList.contains('in-conversation-practice'));
      setInDeepScript(document.body.classList.contains('in-deep-script'));
    };

    // Check initially
    checkBodyModes();

    // Set up observer to watch for class changes
    const observer = new MutationObserver(checkBodyModes);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Check if play button should be disabled during tutorial
  const isPlayDisabled = currentTutorial?.id === 'firstTime' && currentStepIndex < 4;

  const handlePlay = React.useCallback(
    (event) => {
      event.preventDefault();
      if (!isPlayDisabled) {
        setShowPlayModal(true);
      }
    },
    [setShowPlayModal, isPlayDisabled]
  );

  const handleNavClick = React.useCallback(() => {
    // Close the game modal if it's open
    if (isGameVisible) {
      closeGame?.();
    }
    // Close the play-mode modal if it's open
    if (showPlayModal) {
      setShowPlayModal(false);
    }
  }, [isGameVisible, closeGame, showPlayModal, setShowPlayModal]);

  return (
    <div className={`app-shell ${appFontClass}`}>
      <LanguageOnboardingModal />
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PlayModeModal />
      <main className={`flex-1 main-content ${fontClass}`} dir={direction}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/achievements" element={<AchievementsView />} />
          <Route path="/read" element={<LearnView />} />
          <Route path="/bridge" element={<BridgeBuilderView />} />
          <Route path="/deep-script" element={<DeepScriptView />} />
          <Route path="/daily" element={<DailyView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/play" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {!(isGameVisible && isGameRunning) && !inConversationPractice && !inDeepScript && (
        <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around px-4 pb-8 pt-2">
          <div className="fixed bottom-6 left-6 right-6 flex h-16 items-center justify-around rounded-full px-2 backdrop-blur-xl" style={{ background: 'var(--app-nav-bg)', border: '1px solid var(--app-nav-border)', boxShadow: '0 4px 24px var(--app-nav-shadow), 0 1px 4px var(--app-nav-shadow)' }}>
            <NavLink
              to="/home"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item flex flex-col items-center justify-center px-5 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-90 ${isActive ? 'nav-item-active' : ''}`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--app-muted)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>home</span>
              <span>Home</span>
            </NavLink>

            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlayDisabled}
              className="nav-item flex flex-col items-center justify-center px-4 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: 'var(--app-muted)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>videogame_asset</span>
              <span>Play</span>
            </button>

            <NavLink
              to="/achievements"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item flex flex-col items-center justify-center px-5 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-90 ${isActive ? 'nav-item-active' : ''}`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--app-muted)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>emoji_events</span>
              <span>Awards</span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item flex flex-col items-center justify-center px-5 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-90 ${isActive ? 'nav-item-active' : ''}`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--app-muted)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>settings</span>
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MigrationInitializer>
        <LanguageProvider>
          <LocalizationProvider>
            <ToastProvider>
              <ProgressProvider>
                <SRSProvider>
                  <TutorialProvider>
                    <GameProvider>
                      <Shell />
                    </GameProvider>
                  </TutorialProvider>
                </SRSProvider>
              </ProgressProvider>
            </ToastProvider>
          </LocalizationProvider>
        </LanguageProvider>
      </MigrationInitializer>
    </ErrorBoundary>
  );
}
