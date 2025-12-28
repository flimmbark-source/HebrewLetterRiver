import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

function TaskCard({ task, accent, onClaim, claiming }) {
  const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
  const rewardValue = Number.isFinite(task.rewardStars) ? Math.max(0, task.rewardStars) : 0;
  const formattedReward = rewardValue.toLocaleString();
  const claimable = Boolean(task.rewardClaimable) && !task.rewardClaimed;
  const statusLabel = task.rewardClaimed
    ? 'Reward collected'
    : claimable
    ? `Claim +${formattedReward} ⭐`
    : task.completed
    ? 'Quest complete'
    : 'In progress…';
  return (
    <div
      className={`quest-card rounded-3xl border bg-slate-900/70 shadow-inner transition ${
        claimable ? 'border-amber-400/40 ring-1 ring-amber-300/60' : 'border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="quest-category text-slate-400">{task.title}</p>
          <h3 className="quest-title text-white">{task.description}</h3>
        </div>
        <span className={`quest-badge rounded-full px-3 py-1 ${accent}`}>
          {task.completed ? 'Complete' : 'In Progress'}
        </span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="quest-progress-text text-slate-300">{statusLabel}</span>
        <span className="quest-progress-text text-slate-300">
          {task.progress ?? 0} / {task.goal}
        </span>
      </div>
      {rewardValue > 0 && (
        <div className="mt-4 space-y-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4">
          <div className="flex items-center justify-between">
            <span className="quest-reward-text text-amber-100">Quest reward</span>
            <span className="quest-reward-text text-amber-100">+{formattedReward} ⭐</span>
          </div>
          {task.rewardClaimed ? (
            <p className="quest-reward-text text-amber-100/80">Reward collected</p>
          ) : (
            <button
              type="button"
              onClick={() => (claimable && !claiming && onClaim ? onClaim(task.id) : null)}
              disabled={!claimable || claiming}
              className="w-full rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming ? 'Claiming…' : `Claim +${formattedReward} ⭐`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DailyView() {
  const { daily, getWeakestLetter, claimDailyReward } = useProgress();
  const { openGame } = useGame();
  const { languagePack, t } = useLocalization();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';

  const [celebrating, setCelebrating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimingTaskId, setClaimingTaskId] = useState(null);
  const celebrationTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetLabel = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const focusLetter = useMemo(() => {
    const focusTask = daily?.tasks?.find((task) => task.id === 'focus');
    if (focusTask?.meta?.letter) return focusTask.meta.letter;
    return getWeakestLetter().hebrew;
  }, [daily?.tasks, getWeakestLetter]);

  const tasks = daily?.tasks ?? [];
  const claimableTasks = tasks.filter((task) => task.rewardClaimable && !task.rewardClaimed);
  const rewardStars = claimableTasks.reduce(
    (sum, task) => sum + (Number.isFinite(task.rewardStars) ? task.rewardStars : 0),
    0
  );
  const rewardClaimed = tasks.length > 0 && tasks.every((task) => task.rewardClaimed);
  const dailyClaimable = claimableTasks.length > 0;
  const formatNumber = useCallback((value) => Math.max(0, Math.floor(value ?? 0)).toLocaleString(), []);

  const triggerCelebration = useCallback(() => {
    setCelebrating(true);
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
    }
    celebrationTimer.current = setTimeout(() => {
      setCelebrating(false);
      celebrationTimer.current = null;
    }, 1200);
  }, []);

  const handleClaimAll = useCallback(() => {
    if (!dailyClaimable || claiming || claimingTaskId) return;
    setClaiming(true);
    Promise.resolve(claimDailyReward()).then((result) => {
      if (result?.success) {
        triggerCelebration();
      }
    }).finally(() => {
      setClaiming(false);
    });
  }, [claimDailyReward, claiming, dailyClaimable, triggerCelebration]);

  const handleClaimTask = useCallback(
    (taskId) => {
      if (!taskId || claiming || claimingTaskId) return;
      setClaimingTaskId(taskId);
      Promise.resolve(claimDailyReward(taskId)).then((result) => {
        if (result?.success) {
          triggerCelebration();
        }
      }).finally(() => {
        setClaimingTaskId(null);
      });
    },
    [claimDailyReward, claimingTaskId, triggerCelebration]
  );

  const rewardHighlightClass = celebrating
    ? 'ring-2 ring-amber-400/70 shadow-amber-300/30 animate-pulse'
    : dailyClaimable
    ? 'border-amber-400/40'
    : '';

  const claimedDate = daily?.claimedAt ? new Date(daily.claimedAt).toLocaleDateString() : null;

  if (!daily) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading daily quests…
      </div>
    );
  }

  return (
    <div className="space-y-10">

      <section
        className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-inner transition ${rewardHighlightClass}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{t('daily.badge.title')}</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              {dailyClaimable ? t('daily.badge.claimStars') : rewardClaimed ? t('daily.badge.rewardsCollected') : t('daily.badge.completeQuests')}
            </h2>
            <p className="text-sm text-slate-300">
              {dailyClaimable
                ? t('daily.badge.starsReady', { stars: formatNumber(rewardStars) })
                : t('daily.badge.finishQuests')}
            </p>
          </div>
          {dailyClaimable ? (
            <button
              type="button"
              onClick={handleClaimAll}
              disabled={claiming || Boolean(claimingTaskId)}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming ? 'Claiming…' : `Claim all +${formatNumber(rewardStars)} ⭐`}
            </button>
          ) : (
            <span className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300">
              {rewardClaimed ? `Claimed ${claimedDate ?? 'today'}` : 'Keep going!'}
            </span>
          )}
        </div>
      </section>

      <section className="quest-cards-container">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            accent={task.completed ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-yellow-500/20 text-yellow-900 border border-yellow-500/40'}
            onClaim={handleClaimTask}
            claiming={claiming || claimingTaskId === task.id}
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
