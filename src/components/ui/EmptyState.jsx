import React from 'react';

/**
 * Reusable empty-state component.
 *
 * @param {object}   props
 * @param {string}   props.icon         - Material Symbols icon name
 * @param {string}   props.title        - Heading text
 * @param {string}   [props.description] - Explanatory text
 * @param {string}   [props.actionLabel] - Optional CTA button label
 * @param {function} [props.onAction]    - Optional CTA click handler
 * @param {string}   [props.className]   - Additional CSS classes
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {icon && (
        <span
          className="material-symbols-outlined mb-4"
          style={{
            fontSize: '56px',
            color: 'var(--app-muted)',
            opacity: 0.45,
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {title && (
        <h3
          className="text-lg font-bold mb-1"
          style={{ color: 'var(--app-on-surface)' }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-sm max-w-xs"
          style={{ color: 'var(--app-muted)' }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold transition-colors"
          style={{
            background: 'var(--app-primary)',
            color: 'var(--app-on-primary)',
          }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Pre-built empty states ─────────────────────────────────

export function DailyQuestsEmpty() {
  return (
    <EmptyState
      icon="task_alt"
      title="All quests complete!"
      description="Come back tomorrow for new daily challenges."
    />
  );
}

export function AchievementsEmpty({ onAction }) {
  return (
    <EmptyState
      icon="emoji_events"
      title="No achievements yet"
      description="Start playing to earn your first achievement!"
      actionLabel="Start playing"
      onAction={onAction}
    />
  );
}

export function ReviewsEmpty() {
  return (
    <EmptyState
      icon="check_circle"
      title="Nothing to review"
      description="Great work! You're all caught up."
    />
  );
}
