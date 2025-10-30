import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import badgesCatalog from '../data/badges.json';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';

function TaskCard({ task, accent }) {
  const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-inner">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{task.title}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{task.description}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>{task.completed ? 'Complete' : 'In Progress'}</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-300">
        {task.progress ?? 0} / {task.goal}
      </p>
    </div>
  );
}

export default function HomeView() {
  const navigate = useNavigate();
  const { player, streak, daily, getWeakestLetter } = useProgress();
  
  const { openGame } = useGame();

  const latestBadge = useMemo(() => {
    if (!player.latestBadge) return null;
    const badge = badgesCatalog.find((item) => item.id === player.latestBadge.id);
    if (!badge) return null;
    return {
      ...player.latestBadge,
      name: badge.name,
      summary: badge.summary
    };
  }, [player.latestBadge]);

  const focusLetter = useMemo(() => {
    const focusTask = daily?.tasks?.find((task) => task.id === 'focus');
    if (focusTask?.meta?.letter) return focusTask.meta.letter;
    return getWeakestLetter().hebrew;
  }, [daily?.tasks, getWeakestLetter]);
  
  const starsTarget = useMemo(() => {
    if (!player.stars) return 50;
    const base = Math.ceil(player.stars / 50) * 50;
    return Math.max(base, 50);
  }, [player.stars]);

  if (!daily) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading daily quests…
      </div>
    );
  }

  const starsProgress = Math.min(player.stars / starsTarget, 1);
  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetTime = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Today&apos;s Daily Quest</p>
            <h1 className="text-4xl font-bold text-white">Flow through all three river challenges.</h1>
            <p className="max-w-2xl text-slate-300">
              Keep your streak alive and claim fresh stars by completing the Warm-Up, Focus, and Spice quests tailored just for you.
            </p>
          </div>
            <button
              onClick={() => openGame({ mode: 'letters' })}
              className="rounded-full bg-cyan-500 px-6 py-3 text-lg font-semibold text-slate-900 shadow-lg transition hover:bg-cyan-400 hover:shadow-cyan-500/30"
            >
              Start a New Run
            </button>
            <button
              onClick={() => openGame({ mode: 'letters', forceLetter: focusLetter })}
              className="rounded-full border border-cyan-500/60 px-6 py-3 text-lg font-semibold text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Practice Focus Letter
            </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-200">Progress today</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Streak</p>
            <p className="mt-2 text-3xl font-semibold text-white">{streak.current} days</p>
            <p className="mt-1 text-xs text-slate-500">Resets at 00:00 Asia/Jerusalem ({nextResetTime})</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Star meter</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {player.stars} ⭐ / {starsTarget}
            </p>
            <p className="mt-1 text-xs text-slate-500">Earn stars by unlocking badge tiers.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Latest badge</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-lg font-semibold text-white">{latestBadge.name}</p>
                <p className="text-sm text-cyan-300">{latestBadge.label}</p>
                <p className="text-xs text-slate-400">Tier {latestBadge.tier} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Play a session to start unlocking achievements.</p>
            )}
          </div>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        {daily?.tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            accent={task.completed ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20'}
          />
        ))}
      </section>

    </div>
  );
}
