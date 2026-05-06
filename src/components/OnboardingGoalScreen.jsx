import React from 'react';

const goals = [
  {
    id: 'beginner',
    icon: 'child_care',
    title: "I'm brand new",
    description: 'Start from scratch and learn the alphabet step by step.'
  },
  {
    id: 'familiar',
    icon: 'lightbulb',
    title: 'I know a little',
    description: 'I recognize some letters and want to level up.'
  },
  {
    id: 'returning',
    icon: 'event_repeat',
    title: 'I want daily practice',
    description: 'I know the basics and want to stay sharp.'
  }
];

export default function OnboardingGoalScreen({ onSelect }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 app-scroll-safe-bottom animate-fade-in"
      style={{ background: 'var(--app-bg)' }}
    >
      <div
        className="animate-scale-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-8"
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <h2
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
        >
          What brings you here?
        </h2>
        <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--app-muted)' }}>
          This helps us tailor your first experience.
        </p>

        <div className="mt-6 space-y-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => onSelect(goal.id)}
              className="group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
              style={{
                background: 'var(--app-surface, var(--app-card-bg))',
                border: '2px solid var(--app-card-border)',
                cursor: 'pointer'
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--app-primary-container)' }}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{
                    color: 'var(--app-primary)',
                    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                  }}
                  aria-hidden="true"
                >
                  {goal.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold" style={{ color: 'var(--app-on-surface)' }}>
                  {goal.title}
                </p>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--app-muted)' }}>
                  {goal.description}
                </p>
              </div>
              <span
                className="material-symbols-outlined shrink-0 text-xl"
                style={{
                  color: 'var(--app-muted)',
                  fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                }}
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
