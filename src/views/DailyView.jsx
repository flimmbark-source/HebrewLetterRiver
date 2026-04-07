import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

const MODE_LABELS = {
  letterRiver: 'Letter River',
  bridgeBuilder: 'Vocab Builder',
  deepScript: 'Deep Script',
};

function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function TaskCard({ task, onClaim, claiming }) {
  const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
  const rewardValue = Number.isFinite(task.rewardStars) ? Math.max(0, task.rewardStars) : 0;
  const formattedReward = rewardValue.toLocaleString();
  const modeLabel = MODE_LABELS[task.mode] ?? null;
  const claimable = Boolean(task.rewardClaimable) && !task.rewardClaimed;
  const statusLabel = task.rewardClaimed
    ? 'Reward collected'
    : claimable
    ? `Claim +${formattedReward}`
    : task.completed
    ? 'Quest complete'
    : 'In progress…';
  return (
    <div
      className="card-elevated quest-card rounded-2xl p-5 transition-all duration-200"
      style={claimable ? { borderColor: 'var(--app-secondary)', borderWidth: '2px' } : {}}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="quest-category text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>{task.title}</p>
            {modeLabel && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                background: 'var(--app-mode-deep-bg)',
                color: 'var(--app-mode-deep)',
                border: '1px solid var(--app-card-border)',
              }}>
                {modeLabel}
              </span>
            )}
          </div>
          <h3 className="quest-title mt-1 text-base font-semibold" style={{ color: 'var(--app-on-surface)' }}>{task.description}</h3>
        </div>
        <span
          className="quest-badge shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
          style={task.completed
            ? { background: 'var(--app-primary-container)', color: 'var(--app-primary)' }
            : { background: 'var(--app-secondary-container)', color: 'var(--app-secondary)' }
          }
        >
          {task.completed ? 'Complete' : 'In Progress'}
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--app-surface-high)' }}>
        <div className="progress-fill h-full rounded-full" style={{ width: `${percentage}%`, background: 'var(--app-progress-fill)' }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="quest-progress-text text-sm" style={{ color: 'var(--app-muted)' }}>{statusLabel}</span>
        <span className="quest-progress-text text-sm" style={{ color: 'var(--app-muted)' }}>
          {task.progress ?? 0} / {task.goal}
        </span>
      </div>
      {rewardValue > 0 && (
        <div className="mt-4 space-y-3 rounded-xl p-4" style={{ background: 'var(--app-secondary-container)', border: '1px solid var(--app-card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--app-secondary)' }}>Quest reward</span>
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--app-secondary)' }}>
              +{formattedReward} <Icon className="text-sm" filled>star</Icon>
            </span>
          </div>
          {task.rewardClaimed ? (
            <p className="text-xs font-semibold" style={{ color: 'var(--app-muted)' }}>Reward collected</p>
          ) : (
            <button
              type="button"
              onClick={() => (claimable && !claiming && onClaim ? onClaim(task.id) : null)}
              disabled={!claimable || claiming}
              className="btn-press w-full rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'var(--app-secondary)', color: 'var(--app-on-primary)' }}
            >
              {claiming ? 'Claiming…' : `Claim +${formattedReward}`}
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

  const claimedDate = daily?.claimedAt ? new Date(daily.claimedAt).toLocaleDateString() : null;

  if (!daily) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-card-border)', color: 'var(--app-muted)' }}>
        Loading daily quests…
      </div>
    );
  }

  return (
    <div className="space-y-8 stagger-children">

      <section
        className="relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, var(--app-primary-light) 0%, var(--app-primary) 50%, #145e42 100%)',
          color: 'var(--app-on-primary)',
          ...(celebrating ? { boxShadow: '0 0 0 3px var(--app-secondary), 0 8px 24px rgba(26, 122, 85, 0.3)' } : {}),
        }}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl" style={{ background: 'rgba(255, 255, 255, 0.08)' }}></div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{t('daily.badge.title')}</p>
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
              {dailyClaimable ? t('daily.badge.claimStars') : rewardClaimed ? t('daily.badge.rewardsCollected') : t('daily.badge.completeQuests')}
            </h2>
            <p className="text-sm opacity-80">
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
              className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'var(--app-secondary)', color: '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(176, 120, 48, 0.3)' }}
            >
              {claiming ? 'Claiming…' : `Claim all +${formatNumber(rewardStars)}`}
            </button>
          ) : (
            <span className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
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
            onClaim={handleClaimTask}
            claiming={claiming || claimingTaskId === task.id}
          />
        ))}
      </section>

      <section className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--app-on-surface)', fontFamily: '"Baloo 2", system-ui, sans-serif' }}>Tips for today&apos;s run</h2>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--app-muted)' }}>
          <li>• Warm-Up completes when you finish two full game sessions.</li>
          <li>
            • Focus tracks perfect catches featuring <span className={`${fontClass} text-2xl`} style={{ color: 'var(--app-primary)' }}>{focusLetter}</span> — drop with precision.
          </li>
          <li>• Spice checks your constraint — toggle the setting before you press start and finish a session to clear it.</li>
        </ul>
      </section>
    </div>
  );
}
