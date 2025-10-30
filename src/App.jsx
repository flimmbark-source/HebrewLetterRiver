import React from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import LearnView from './views/LearnView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { GameProvider, useGame } from './context/GameContext.jsx';

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

function Shell() {
  const { openGame } = useGame();

  const handlePlay = React.useCallback(
    (event) => {
      event.preventDefault();
      openGame({ autostart: true });
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
    >
      <header className="flex flex-col gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white hebrew-font sm:text-4xl">Hebrew Letter River</h1>
          <p className="text-sm text-slate-400 sm:text-base">Flow, learn, and celebrate every catch.</p>
        </div>
      </header>
      <main className="flex-1 pb-6">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/achievements" element={<AchievementsView />} />
          <Route path="/learn" element={<LearnView />} />
        </Routes>
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex w-full max-w-3xl justify-between gap-2">
          <NavLink to="/home" className={tabClass}>
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </NavLink>
          <button
            type="button"
            onClick={handlePlay}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:text-sm"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Play</span>
          </button>
          <NavLink to="/achievements" className={tabClass}>
            <TrophyIcon className="h-5 w-5" />
            <span>Achievements</span>
          </NavLink>
          <NavLink to="/learn" className={tabClass}>
            <BookIcon className="h-5 w-5" />
            <span>Learn</span>
          </NavLink>
        </div>
      </nav>
      <footer className="pb-6 text-center text-xs text-slate-600 sm:text-sm">Reset happens daily at 00:00 Asia/Jerusalem.</footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ProgressProvider>
        <GameProvider>
          <div className="min-h-screen bg-slate-950 text-white">
            <Shell />
          </div>
        </GameProvider>
      </ProgressProvider>
    </ToastProvider>
  );
}
