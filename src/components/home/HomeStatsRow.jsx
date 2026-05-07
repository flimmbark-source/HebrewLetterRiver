import React from 'react';

function Icon({ children, filled = true }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function HomeStatsRow({ stats, t }) {
  return (
    <section className="scenic-stats-row" aria-label={t('home.scenic.statsAria', 'Daily progress summary')}>
      {stats.map((stat) => (
        <div key={stat.id} className="scenic-stat-card">
          <span className={`scenic-stat-card__icon scenic-tone-${stat.tone}`}>
            <Icon>{stat.icon}</Icon>
          </span>
          <span>
            <strong>{stat.title}</strong>
            <small>{stat.value}</small>
          </span>
        </div>
      ))}
    </section>
  );
}
