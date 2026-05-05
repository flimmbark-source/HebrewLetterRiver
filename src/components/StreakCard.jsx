import React, { useMemo } from 'react';
import { useProgress, STREAK_MILESTONES } from '../context/ProgressContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { getJerusalemDateKey } from '../lib/time.js';

function Icon({ children, className = '', filled = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`, ...style }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function getStreakMessage(current, t) {
  if (current === 0) return t('streak.startJourney', 'Start your journey!');
  if (current === 1) return t('streak.greatStart', 'Great start! Keep it going');
  if (current < 3) return t('streak.buildingMomentum', "You're building momentum!");
  if (current < 7) return t('streak.onFire', "You're on fire!");
  if (current < 30) return t('streak.incredibleDedication', 'Incredible dedication!');
  return t('streak.legendaryCommitment', 'Legendary commitment!');
}

function getFlameSize(current) {
  if (current === 0) return 'text-3xl';
  if (current < 3) return 'text-4xl';
  if (current < 7) return 'text-5xl';
  if (current < 30) return 'text-5xl';
  return 'text-6xl';
}

function getFlameColor(current) {
  if (current === 0) return 'var(--app-muted)';
  if (current < 3) return '#f59e0b';
  if (current < 7) return '#f97316';
  if (current < 30) return '#ef4444';
  return '#dc2626';
}

export default function StreakCard() {
  const { streak, player, repairStreak, useStreakFreeze } = useProgress();
  const { t, appLanguageId } = useLocalization();
  const todayKey = getJerusalemDateKey();
  const completedToday = streak.lastPlayedDateKey === todayKey;

  const nextMilestone = useMemo(() => {
    const milestones = STREAK_MILESTONES;
    const claimed = streak.milestonesClaimed ?? [];
    for (const m of milestones) {
      if (streak.current < m.days) {
        const daysLeft = m.days - streak.current;
        return { ...m, daysLeft };
      }
    }
    return null;
  }, [streak.current, streak.milestonesClaimed]);

  const repairAvailable = useMemo(() => {
    if (!streak.repairAvailableUntil) return false;
    return new Date(streak.repairAvailableUntil) > new Date();
  }, [streak.repairAvailableUntil]);

  const canAffordRepair = (player?.stars ?? 0) >= 20;
  const freezesAvailable = streak.freezesAvailable ?? 0;

  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl p-6">
      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background: streak.current > 0
            ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, var(--app-muted) 0%, var(--app-muted) 100%)'
        }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Flame icon */}
            <div className="flex items-center justify-center">
              <Icon
                className={getFlameSize(streak.current)}
                filled={streak.current > 0}
                style={{ color: getFlameColor(streak.current) }}
              >
                local_fire_department
              </Icon>
            </div>

            {/* Streak count */}
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-black tabular-nums"
                  style={{ color: 'var(--app-on-surface)' }}
                >
                  {streak.current}
                </span>
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: 'var(--app-muted)' }}
                >
                  {streak.current === 1 ? t('common.day', 'day') : t('common.days', 'days')}
                </span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: streak.current > 0 ? getFlameColor(streak.current) : 'var(--app-muted)' }}
              >
                {getStreakMessage(streak.current, t)}
              </p>
            </div>
          </div>

          {/* Freeze indicator */}
          {freezesAvailable > 0 && (
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: 'var(--app-primary-container)' }}
              title={`${freezesAvailable} streak freeze${freezesAvailable > 1 ? 's' : ''} available`}
            >
              <Icon className="text-base" style={{ color: 'var(--app-primary)' }}>ac_unit</Icon>
              <span className="text-xs font-bold" style={{ color: 'var(--app-primary)' }}>
                {freezesAvailable}
              </span>
            </div>
          )}
        </div>

        {/* Status + milestone row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Today status */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              background: completedToday ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.1)',
              border: completedToday ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(245, 158, 11, 0.2)'
            }}
          >
            <Icon
              className="text-sm"
              filled
              style={{ color: completedToday ? '#22c55e' : '#f59e0b' }}
            >
              {completedToday ? 'check_circle' : 'schedule'}
            </Icon>
            <span
              className="text-xs font-bold"
              style={{ color: completedToday ? '#22c55e' : '#f59e0b' }}
            >
              {completedToday ? 'Today: Complete' : 'Today: Not yet'}
            </span>
          </div>

          {/* Next milestone */}
          {nextMilestone && (
            <span className="text-xs font-medium" style={{ color: 'var(--app-muted)' }}>
              {nextMilestone.daysLeft} more {nextMilestone.daysLeft === 1 ? 'day' : 'days'} until {nextMilestone.label}!
            </span>
          )}
        </div>

        {/* Repair button */}
        {repairAvailable && (
          <button
            type="button"
            onClick={() => repairStreak(20)}
            disabled={!canAffordRepair}
            className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
            style={{
              background: canAffordRepair ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'var(--app-surface-highest)',
              color: canAffordRepair ? '#fff' : 'var(--app-muted)',
              opacity: canAffordRepair ? 1 : 0.6
            }}
          >
            <Icon className="text-base" filled>build</Icon>
            <span>Repair streak (20 stars)</span>
            {streak.preBreakCurrent && (
              <span className="opacity-80">
                &mdash; restore to {streak.preBreakCurrent} days
              </span>
            )}
          </button>
        )}

        {/* Best streak */}
        {streak.best > streak.current && streak.best > 1 && (
          <p className="mt-3 text-xs font-medium" style={{ color: 'var(--app-muted)' }}>
            Personal best: {streak.best} days
          </p>
        )}
      </div>
    </div>
  );
}


