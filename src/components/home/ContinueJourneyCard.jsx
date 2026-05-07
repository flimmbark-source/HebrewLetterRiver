import React from 'react';

function Icon({ children }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{children}</span>;
}

export default function ContinueJourneyCard({ state }) {
  return (
    <section className="scenic-panel scenic-continue-card">
      <h2>Continue Your Journey</h2>
      <div className="scenic-continue-card__body">
        <img className="scenic-continue-card__thumb" src={state.image} alt="" aria-hidden="true" />
        <div className="scenic-continue-card__content">
          <h3>{state.title}</h3>
          <p className="scenic-continue-card__subtitle">{state.subtitle}</p>
          <p className="scenic-continue-card__detail">{state.detail}</p>
          <div className="scenic-progress" aria-hidden="true">
            <span style={{ width: `${state.progress}%` }} />
          </div>
          <button type="button" className="scenic-cta btn-press" onClick={state.action}>
            <Icon>play_arrow</Icon>
            <span>{state.cta}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
