import React from 'react';

/**
 * PATH-03: Pack & Module Progress
 *
 * A reusable progress indicator showing completion state.
 *
 * @param {Object} props
 * @param {'not_started'|'in_progress'|'review'|'mastered'} props.status
 * @param {number}  props.percentage - 0-100
 * @param {'sm'|'md'|'lg'} props.size - visual size
 */

const SIZE_MAP = {
  sm: { outer: 20, stroke: 2.5, icon: 10 },
  md: { outer: 32, stroke: 3, icon: 16 },
  lg: { outer: 44, stroke: 3.5, icon: 22 }
};

function statusColor(status) {
  switch (status) {
    case 'mastered':   return '#D4A017';
    case 'review':     return 'var(--app-mode-bridge, #F5A623)';
    case 'in_progress': return 'var(--app-primary, #1B7D55)';
    case 'not_started':
    default:           return 'var(--app-muted, #9CA3AF)';
  }
}

export default function ProgressIndicator({ status = 'not_started', percentage = 0, size = 'md' }) {
  const dim = SIZE_MAP[size] ?? SIZE_MAP.md;
  const radius = (dim.outer - dim.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (pct / 100) * circumference;
  const color = statusColor(status);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dim.outer, height: dim.outer }}
      role="img"
      aria-label={`${status.replace('_', ' ')}: ${pct}%`}
    >
      <svg width={dim.outer} height={dim.outer} className="absolute inset-0 -rotate-90">
        {/* Background track */}
        <circle
          cx={dim.outer / 2}
          cy={dim.outer / 2}
          r={radius}
          fill="none"
          stroke="var(--app-muted, #E5E7EB)"
          strokeWidth={dim.stroke}
          opacity={0.25}
        />
        {/* Progress arc */}
        {status !== 'not_started' && (
          <circle
            cx={dim.outer / 2}
            cy={dim.outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={status === 'mastered' ? 0 : offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        )}
      </svg>

      {/* Center icon */}
      {status === 'mastered' ? (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: dim.icon,
            color,
            fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24"
          }}
          aria-hidden="true"
        >
          check
        </span>
      ) : status === 'not_started' ? (
        <span
          style={{
            width: dim.icon * 0.4,
            height: dim.icon * 0.4,
            borderRadius: '50%',
            background: color
          }}
        />
      ) : null}
    </div>
  );
}
