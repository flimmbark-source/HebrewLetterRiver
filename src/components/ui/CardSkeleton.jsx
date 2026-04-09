import React from 'react';
import Skeleton from './Skeleton.jsx';

/**
 * Pre-composed skeleton that matches the app's card layout.
 * Useful as a loading placeholder for HomeView, DailyView, AchievementsView cards.
 *
 * @param {object} props
 * @param {number} [props.lines=3]   - Number of text lines to show
 * @param {boolean} [props.hasIcon]  - Whether to show a circular icon placeholder
 * @param {string} [props.className] - Additional CSS classes
 */
export default function CardSkeleton({ lines = 3, hasIcon = false, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-5 space-y-3 ${className}`}
      style={{
        background: 'var(--app-card-bg)',
        border: '1px solid var(--app-card-border)',
      }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        {hasIcon && <Skeleton variant="circle" width={40} height={40} />}
        <Skeleton variant="text" width="55%" height={18} />
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '40%' : '90%'}
          height={14}
        />
      ))}
    </div>
  );
}
