import React from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import DailyView from './views/DailyView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { GameProvider } from './context/GameContext.jsx';

function Navigation() {
  const links = [
    { to: '/home', label: 'Home' },
    { to: '/daily', label: 'Daily Quests' },
    { to: '/achievements', label: 'Achievements' }
  ];

  return (
    <nav className="rounded-full border border-slate-800 bg-slate-900/60 p-1 text-sm text-slate-300 shadow-inner">
      <ul className="flex items-center gap-1">
        {links.map((link) => (
          <li key={link.to} className="flex-1">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-full px-4 py-2 text-center font-medium transition ${
                  isActive ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/40 shadow-lg' : 'hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Shell() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white hebrew-font">Hebrew Letter River</h1>
          <p className="text-sm text-slate-400">Flow, learn, and celebrate every catch.</p>
        </div>
        <Navigation />
      </header>
      <main className="flex-1 pb-10">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/daily" element={<DailyView />} />
          <Route path="/achievements" element={<AchievementsView />} />
        </Routes>
      </main>
      <footer className="pb-6 text-center text-xs text-slate-600">Reset happens daily at 00:00 Asia/Jerusalem.</footer>
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
