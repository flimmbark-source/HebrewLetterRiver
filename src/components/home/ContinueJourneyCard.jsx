import React from 'react';
import Icon from '../Icon.jsx';

/**
 * Progress details arrive as one interpolated string, e.g.
 * "Seen 4 · Practiced 2 · Mastered 1". In the narrow column beside the
 * thumbnail that wraps mid-pair and orphans a number on its own line. Split
 * on the separator so each label keeps its value, and let the line break
 * only between pairs. A detail with no separator renders unchanged.
 */
function ProgressDetail({ text }) {
  if (typeof text !== 'string' || !text.includes('\u00b7')) return text ?? null;

  const parts = text.split('\u00b7').map((part) => part.trim()).filter(Boolean);

  return parts.map((part, index) => (
    <React.Fragment key={`${index}-${part}`}>
      {index > 0 && <span aria-hidden="true"> · </span>}
      <span style={{ whiteSpace: 'nowrap' }}>{part}</span>
    </React.Fragment>
  ));
}

export default function ContinueJourneyCard({ state, t }) {
  return (
    <section className="scenic-panel scenic-continue-card">
      <h2>{t('home.scenic.continueTitle', 'Continue Your Journey')}</h2>
      <div className="scenic-continue-card__body">
        <img className="scenic-continue-card__thumb" src={state.image} alt="" aria-hidden="true" />
        <div className="scenic-continue-card__content">
          <h3>
            {state.locked && <Icon name="lock" size={16} filled />} {state.title}
          </h3>
          <p className="scenic-continue-card__subtitle">{state.subtitle}</p>
          <p className="scenic-continue-card__detail">
            <ProgressDetail text={state.detail} />
          </p>
          <div className="scenic-progress" aria-hidden="true">
            <span style={{ width: `${state.progress}%` }} />
          </div>
          <button type="button" className="scenic-cta btn-press" onClick={state.action}>
            <Icon name="play_arrow" size={20} filled />
            <span>{state.cta}</span>
          </button>
          {state.secondaryCta && (
            <button
              type="button"
              className="scenic-continue-card__secondary"
              onClick={state.secondaryCta.action}
            >
              {state.secondaryCta.label}
            </button>
          )}
          {state.infoAction && (
            <button type="button" className="scenic-continue-card__info" onClick={state.infoAction}>
              <Icon name="info" size={15} />
              <span>{t('home.scenic.aboutStage', 'What do I learn here?')}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
