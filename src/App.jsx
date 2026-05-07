import React from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import LearnView from './views/LearnView.jsx';
import BridgeBuilderView from './views/BridgeBuilderView.jsx';
import DeepScriptView from './views/DeepScriptView.jsx';
import SettingsView from './views/SettingsView.jsx';
import DailyView from './views/DailyView.jsx';
import DebugDashboardView from './views/DebugDashboardView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { SRSProvider } from './context/SRSContext.jsx';
import { GameProvider, useGame } from './context/GameContext.jsx';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { ExperimentProvider } from './context/ExperimentContext.jsx';
import { TutorialProvider, useTutorial } from './context/TutorialContext.jsx';
import { PremiumProvider } from './context/PremiumContext.jsx';
import { getFormattedLanguageName } from './lib/languageUtils.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import MigrationInitializer from './components/MigrationInitializer.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import PlayModeModal from './components/PlayModeModal.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import { useFontSettings } from './hooks/useFontSettings.js';
import './components/AppBottomNav.css';

function LanguageOnboardingModal() {
  const {
    hasSelectedLanguage,
    languageId,
    setLanguageId,
    appLanguageId,
    setAppLanguageId,
    markLanguageSelected,
    languageOptions,
    appLanguageOptions
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 language-onboarding-overlay animate-fade-in"
      style={{ background: 'var(--app-bg)' }}
    >
      <div
        className="animate-scale-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-8 language-onboarding-card"
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <h2
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
        >
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
              style={{ borderColor: 'var(--app-input-border)', background: 'var(--app-input-bg)', color: 'var(--app-on-surface)' }}
            >
              {appLanguageOptions.map((option) => (
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
              style={{ borderColor: 'var(--app-input-border)', background: 'var(--app-input-bg)', color: 'var(--app-on-surface)' }}
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
          style={{ opacity: isContinueDisabled ? 0.5 : 1, cursor: isContinueDisabled ? 'not-allowed' : 'pointer' }}
        >
          {translateOnboarding('app.languagePicker.confirm')}
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const { closeGame, isVisible: isGameVisible, isGameRunning, showPlayModal, setShowPlayModal } = useGame();
  const { interfaceLanguagePack, t } = useLocalization();
  const { currentTutorial } = useTutorial();
  const fontClass = interfaceLanguagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const direction = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';
  const [inConversationPractice, setInConversationPractice] = React.useState(false);
  const [inDeepScript, setInDeepScript] = React.useState(false);
  const location = useLocation();
  const { appFontClass } = useFontSettings();

  React.useEffect(() => {
    const applyGlobalTheme = (darkModeEnabled) => {
      const root = document.documentElement;
      root.classList.toggle('dark-mode', darkModeEnabled);
      document.body.classList.toggle('dark-mode', darkModeEnabled);
      root.setAttribute('data-theme', darkModeEnabled ? 'dark' : 'light');
      document.body.setAttribute('data-theme', darkModeEnabled ? 'dark' : 'light');
    };

    const applyThemeFromSettings = () => {
      try {
        const saved = localStorage.getItem('gameSettings');
        const parsed = saved ? JSON.parse(saved) : {};
        const darkModeEnabled = !!(parsed.darkMode ?? parsed.highContrast ?? false);
        applyGlobalTheme(darkModeEnabled);
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

  React.useEffect(() => {
    const checkBodyModes = () => {
      setInConversationPractice(document.body.classList.contains('in-conversation-practice'));
      setInDeepScript(document.body.classList.contains('in-deep-script'));
    };

    checkBodyModes();
    const observer = new MutationObserver(checkBodyModes);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isPlayDisabled = currentTutorial?.id === 'firstTime';
  const playRoutes = ['/read', '/bridge', '/deep-script'];
  const isPlayActive = playRoutes.includes(location.pathname);

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
    if (isGameVisible) {
      closeGame?.();
    }
    if (showPlayModal) {
      setShowPlayModal(false);
    }
  }, [isGameVisible, closeGame, showPlayModal, setShowPlayModal]);

  return (
    <div className={`app-shell ${appFontClass}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <LanguageOnboardingModal />
      <OnboardingFlow />
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PlayModeModal />
      <main id="main-content" className={`flex-1 main-content app-main ${fontClass}`} dir={direction} tabIndex={-1}>
        <div className="page-scroll">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeView />} />
            <Route path="/achievements" element={<AchievementsView />} />
            <Route path="/read" element={<LearnView />} />
            <Route path="/bridge" element={<BridgeBuilderView />} />
            <Route path="/deep-script" element={<DeepScriptView />} />
            <Route path="/daily" element={<DailyView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/debug" element={<DebugDashboardView />} />
            <Route path="/play" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>
      {!(isGameVisible && isGameRunning) && !inConversationPractice && !inDeepScript && (
        <nav className="bottom-nav" aria-label={t('app.nav.primary', 'Primary navigation')}>
          <NavLink
            to="/home"
            onClick={handleNavClick}
            className={({ isActive }) => `bottom-nav__item nav-item flex flex-col items-center justify-center px-3 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-95 ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>home</span>
            <span>{t('app.nav.home', 'Home')}</span>
          </NavLink>

          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlayDisabled}
            className={`bottom-nav__item nav-item flex flex-col items-center justify-center px-3 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${isPlayActive ? 'nav-item-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>videogame_asset</span>
            <span>{t('app.nav.play', 'Play')}</span>
          </button>

          <NavLink
            to="/achievements"
            onClick={handleNavClick}
            className={({ isActive }) => `bottom-nav__item nav-item flex flex-col items-center justify-center px-3 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-95 ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>emoji_events</span>
            <span>{t('app.nav.achievements', 'Awards')}</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleNavClick}
            className={({ isActive }) => `bottom-nav__item nav-item flex flex-col items-center justify-center px-3 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 active:scale-95 ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>settings</span>
            <span>{t('app.nav.settings', 'Settings')}</span>
          </NavLink>
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
          <ExperimentProvider>
            <LocalizationProvider>
              <ToastProvider>
                <ProgressProvider>
                  <PremiumProvider>
                    <SRSProvider>
                      <TutorialProvider>
                        <GameProvider>
                          <Shell />
                        </GameProvider>
                      </TutorialProvider>
                    </SRSProvider>
                  </PremiumProvider>
                </ProgressProvider>
              </ToastProvider>
            </LocalizationProvider>
          </ExperimentProvider>
        </LanguageProvider>
      </MigrationInitializer>
    </ErrorBoundary>
  );
}
