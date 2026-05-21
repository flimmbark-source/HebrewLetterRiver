import React from 'react';
import Icon from '../Icon.jsx';

export default function HomeStatsRow({ stats, t }) {
  return (
    <section className="scenic-stats-row" aria-label={t('home.scenic.statsAria', 'Daily progress summary')}>
      {stats.map((stat) => (
        <div key={stat.id} className="scenic-stat-card">
          <span className={`scenic-stat-card__icon scenic-tone-${stat.tone}`}>
            <Icon name={stat.icon} size={22} filled />
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
