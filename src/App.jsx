import React from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import LearnView from './views/LearnView.jsx';
import WordRiverView from './views/WordRiverView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { GameProvider, useGame } from './context/GameContext.jsx';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';

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
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 sm:text-base ${selectClassName}`}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-slate-400">{helperText}</p> : null}
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
  const [pendingPracticeId, setPendingPracticeId] = React.useState(languageId);
  const [pendingAppId, setPendingAppId] = React.useState(appLanguageId);

  React.useEffect(() => {
    setPendingPracticeId(languageId);
  }, [languageId]);

  React.useEffect(() => {
    setPendingAppId(appLanguageId);
  }, [appLanguageId]);

  if (hasSelectedLanguage) return null;

  const handleChange = (nextId) => {
    setPendingPracticeId(nextId);
    setLanguageId(nextId);
  };

  const handleAppLanguageChange = (nextId) => {
    setPendingAppId(nextId);
    setAppLanguageId(nextId);
  };

  const handleContinue = () => {
    markLanguageSelected();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-center shadow-2xl sm:p-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {translateOnboarding('app.languagePicker.onboardingTitle')}
        </h2>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          {translateOnboarding('app.languagePicker.onboardingSubtitle')}
        </p>
        <div className="mt-6 space-y-5 text-left">
          <LanguageSelect
            selectId="onboarding-app-language"
            value={pendingAppId}
            onChange={handleAppLanguageChange}
            label={translateOnboarding('app.languagePicker.label')}
            helperText={translateOnboarding('app.languagePicker.helper')}
            options={languageOptions}
          />
          <LanguageSelect
            selectId="onboarding-language"
            value={pendingPracticeId}
            onChange={handleChange}
            label={translateOnboarding('app.practicePicker.label')}
            helperText={translateOnboarding('app.practicePicker.helper')}
            options={languageOptions}
          />
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="mt-6 w-full rounded-full bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-400 sm:w-auto sm:px-8"
        >
          {translateOnboarding('app.languagePicker.confirm')}
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const { openGame } = useGame();
  const { t, interfaceLanguagePack } = useLocalization();
  const { appLanguageId, selectAppLanguage, languageOptions } = useLanguage();
  const fontClass = interfaceLanguagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const direction = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';
  const isAchievementsPage = location.pathname === '/achievements';

  const handlePlay = React.useCallback(
    (event) => {
      event.preventDefault();
      openGame({ autostart: false });
    },
    [openGame]
  );

  const tabClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition sm:text-sm ${
      isActive ? 'bg-cyan-500/20 text-cyan-300 shadow-inner shadow-cyan-500/30' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10"
      style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
      dir={direction}
    >
      <LanguageOnboardingModal />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="text-center sm:text-left">
          <h1 className={`text-3xl font-bold text-white sm:text-4xl ${fontClass}`}>{t('app.title')}</h1>
          <p className="text-sm text-slate-400 sm:text-base">{t('app.tagline')}</p>
        </div>
        {!isAchievementsPage && (
          <div className="sm:min-w-[220px] sm:text-right">
            <LanguageSelect
              selectId="header-language"
              value={appLanguageId}
              onChange={selectAppLanguage}
              label={t('app.languagePicker.label')}
              selectClassName="bg-slate-900/60"
              options={languageOptions}
            />
          </div>
        )}
      </header>
      <main className="mt-8 flex-1 pb-6 sm:mt-10">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/achievements" element={<AchievementsView />} />
          <Route path="/learn" element={<LearnView />} />
          <Route path="/word-river" element={<WordRiverView />} />
        </Routes>
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex w-full max-w-3xl justify-between gap-2">
          <NavLink to="/home" className={tabClass}>
            <HomeIcon className="h-5 w-5" />
            <span>{t('app.nav.home')}</span>
          </NavLink>
          <button
            type="button"
            onClick={handlePlay}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:text-sm"
          >
            <PlayIcon className="h-5 w-5" />
            <span>{t('app.nav.play')}</span>
          </button>
          <NavLink to="/achievements" className={tabClass}>
            <TrophyIcon className="h-5 w-5" />
            <span>{t('app.nav.achievements')}</span>
          </NavLink>
          <NavLink to="/learn" className={tabClass}>
            <BookIcon className="h-5 w-5" />
            <span>{t('app.nav.learn')}</span>
          </NavLink>
        </div>
      </nav>
      <footer className="pb-6 text-center text-xs text-slate-600 sm:text-sm">{t('app.footer.resetNotice')}</footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LocalizationProvider>
        <ToastProvider>
          <ProgressProvider>
            <GameProvider>
              <div className="min-h-screen bg-slate-950 text-white">
                <Shell />
              </div>
            </GameProvider>
          </ProgressProvider>
        </ToastProvider>
      </LocalizationProvider>
    </LanguageProvider>
  );
}
