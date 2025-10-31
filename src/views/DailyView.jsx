import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

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

export default function DailyView() {
  const { daily, getWeakestLetter } = useProgress();
  const { openGame } = useGame();
  const { languagePack } = useLocalization();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetLabel = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const focusLetter = useMemo(() => {
    const focusTask = daily?.tasks?.find((task) => task.id === 'focus');
    if (focusTask?.meta?.letter) return focusTask.meta.letter;
    return getWeakestLetter().hebrew;
  }, [daily?.tasks, getWeakestLetter]);

  if (!daily) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading daily quests…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      <section className="grid gap-6 lg:grid-cols-3">
        {daily?.tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            accent={task.completed ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20'}
          />
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Tips for today&apos;s run</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Warm-Up completes when you finish two full game sessions.</li>
          <li>
            • Focus tracks perfect catches featuring <span className={`${fontClass} text-2xl text-cyan-300`}>{focusLetter}</span> — drop with precision.
          </li>
          <li>• Spice checks your constraint — toggle the setting before you press start and finish a session to clear it.</li>
        </ul>
      </section>
    </div>
  );
}
