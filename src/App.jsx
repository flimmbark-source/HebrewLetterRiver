import React from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import HomeView from './views/HomeView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { GameProvider } from './context/GameContext.jsx';

function Navigation() {
  const links = [
    { to: '/home', label: 'Home' },
    { to: '/achievements', label: 'Achievements' }
  ];

  return (
    <nav className="w-full rounded-full border border-slate-800 bg-slate-900/60 p-1 text-xs text-slate-300 shadow-inner sm:w-auto sm:text-sm">
      <ul className="flex flex-wrap items-center gap-1 sm:flex-nowrap">
        {links.map((link) => (
          <li key={link.to} className="flex-1">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-full px-3 py-2 text-center text-sm font-medium transition sm:px-4 sm:text-base ${
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white hebrew-font sm:text-4xl">Hebrew Letter River</h1>
          <p className="text-sm text-slate-400 sm:text-base">Flow, learn, and celebrate every catch.</p>
        </div>
        <Navigation />
      </header>
      <main className="flex-1 pb-10">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/achievements" element={<AchievementsView />} />
        </Routes>
      </main>
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
