import React, { useEffect, useState, useCallback } from 'react';
import { useProgress, STREAK_MILESTONES } from '../context/ProgressContext.jsx';
import { on } from '../lib/eventBus.js';

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

export default function StreakMilestoneModal() {
  const { streak, claimStreakMilestone } = useProgress();
  const [pendingMilestone, setPendingMilestone] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);

  // Listen for milestone events
  useEffect(() => {
    const off = on('streak:milestones-pending', (payload) => {
      const milestones = payload?.milestones ?? [];
      if (milestones.length > 0) {
        // Show the first unclaimed milestone
        setPendingMilestone(milestones[0]);
        setIsClaimed(false);
      }
    });
    return off;
  }, []);

  // Also check for unclaimed milestones on mount
  useEffect(() => {
    const milestonesClaimed = streak.milestonesClaimed ?? [];
    for (const milestone of STREAK_MILESTONES) {
      if (streak.current >= milestone.days && !milestonesClaimed.includes(milestone.days)) {
        setPendingMilestone(milestone);
        setIsClaimed(false);
        break;
      }
    }
  }, [streak.current, streak.milestonesClaimed]);

  const handleClaim = useCallback(() => {
    if (!pendingMilestone) return;
    const result = claimStreakMilestone(pendingMilestone.days);
    if (result?.success) {
      setIsClaimed(true);
      // Auto-dismiss after short delay
      setTimeout(() => {
        setPendingMilestone(null);
        setIsClaimed(false);
      }, 2000);
    }
  }, [pendingMilestone, claimStreakMilestone]);

  if (!pendingMilestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setPendingMilestone(null)}
      />

      {/* Modal */}
      <div
        className="animate-scale-in relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center shadow-2xl"
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)'
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(245, 158, 11, 0.2)' }}
        />

        <div className="relative z-10">
          {/* Flame icon */}
          <div className="mb-4 flex justify-center">
            <Icon
              className="text-7xl"
              filled
              style={{ color: '#f97316' }}
            >
              local_fire_department
            </Icon>
          </div>

          {/* Milestone label */}
          <h2
            className="text-2xl font-black"
            style={{ color: 'var(--app-on-surface)' }}
          >
            {pendingMilestone.label}
          </h2>

          {/* Days */}
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--app-muted)' }}>
            {pendingMilestone.days}-day streak achieved!
          </p>

          {/* Star reward */}
          <div
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(249, 115, 22, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <span className="text-2xl">&#11088;</span>
            <span
              className="text-xl font-black"
              style={{ color: '#f59e0b' }}
            >
              +{pendingMilestone.stars} stars
            </span>
          </div>

          {/* Claim button */}
          {!isClaimed ? (
            <button
              type="button"
              onClick={handleClaim}
              className="btn-press mt-6 w-full rounded-xl py-4 text-base font-bold shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: '#fff'
              }}
            >
              Claim Reward
            </button>
          ) : (
            <div className="mt-6 flex items-center justify-center gap-2 py-4">
              <Icon className="text-xl" filled style={{ color: '#22c55e' }}>check_circle</Icon>
              <span className="text-base font-bold" style={{ color: '#22c55e' }}>
                Claimed!
              </span>
            </div>
          )}

          {/* Dismiss */}
          {!isClaimed && (
            <button
              type="button"
              onClick={() => setPendingMilestone(null)}
              className="mt-3 text-sm font-medium transition-colors"
              style={{ color: 'var(--app-muted)' }}
            >
              Claim later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
