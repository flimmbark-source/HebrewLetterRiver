import React from 'react';

function Icon({ children, filled = false }) {
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

export default function TodayPlanCard({ rows }) {
  return (
    <section className="scenic-panel scenic-plan-card">
      <h2>Today’s Plan</h2>
      <div className="scenic-plan-card__rows">
        {rows.map((row) => {
          const Element = row.locked ? 'div' : 'button';
          return (
            <Element
              key={row.id}
              type={row.locked ? undefined : 'button'}
              className={`scenic-plan-row ${row.locked ? 'scenic-plan-row--locked' : 'btn-press'}`}
              onClick={row.locked ? undefined : row.action}
              aria-disabled={row.locked ? 'true' : undefined}
            >
              <span className={`scenic-plan-row__icon scenic-tone-${row.tone}`}>
                <Icon filled>{row.icon}</Icon>
              </span>
              <span className="scenic-plan-row__text">
                <strong>{row.title}</strong>
                <small>{row.subtitle}</small>
              </span>
              <span className="scenic-plan-row__end">
                <Icon>{row.locked ? 'lock' : 'chevron_right'}</Icon>
              </span>
            </Element>
          );
        })}
      </div>
    </section>
  );
}
