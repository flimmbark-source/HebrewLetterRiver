import React from 'react';
import Icon from '../Icon.jsx';

export default function TodayPlanCard({ rows, t }) {
  return (
    <section className="scenic-panel scenic-plan-card">
      <h2>{t('home.scenic.todayPlanTitle', 'Today Plan')}</h2>
      <div className="scenic-plan-card__rows">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            disabled={row.locked}
            className={`scenic-plan-row ${row.locked ? 'scenic-plan-row--locked' : 'btn-press'}`}
            onClick={row.locked ? undefined : row.action}
          >
            <span className={`scenic-plan-row__icon scenic-tone-${row.tone}`}>
              <Icon name={row.icon} size={22} filled />
            </span>
            <span className="scenic-plan-row__text">
              <strong>{row.title}</strong>
              <small>{row.subtitle}</small>
            </span>
            <span className="scenic-plan-row__end">
              <Icon name={row.locked ? 'lock' : 'chevron_right'} size={22} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
