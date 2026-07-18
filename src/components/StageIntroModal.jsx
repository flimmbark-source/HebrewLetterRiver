import React, { useEffect } from 'react';
import Modal from './ui/Modal.jsx';
import Icon from './Icon.jsx';
import { celebrate } from '../lib/celebration.js';

/**
 * StageIntroModal — explains a journey stage: what you learn there, how the
 * games teach it, and which modes belong to it.
 *
 * Two modes:
 *   - 'unlock': shown once when the stage first unlocks (confetti celebration)
 *   - 'info':   re-openable explainer from the stage node / continue card
 *
 * @param {Object} props
 * @param {Object|null} props.stage — resolved stage state from useJourney
 * @param {'unlock'|'info'} props.mode
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} [props.onStart] — called when the user taps the CTA
 */
export default function StageIntroModal({ stage, mode = 'info', isOpen, onClose, onStart, t }) {
  const isUnlock = mode === 'unlock';

  useEffect(() => {
    if (isOpen && isUnlock) {
      celebrate();
    }
  }, [isOpen, isUnlock]);

  if (!stage) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="stage-intro-title" className="w-full max-w-md rounded-3xl p-6 sm:p-7">
      <div className="text-center">
        {isUnlock && (
          <p
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: 'var(--app-primary, #f27600)' }}
          >
            {t('journey.intro.unlockedBanner', 'New stage unlocked!')}
          </p>
        )}
        <div
          className="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--app-primary-soft, rgba(46, 143, 189, 0.14))', color: 'var(--app-primary, #1e6b9a)' }}
        >
          <Icon name={stage.icon} size={34} filled />
        </div>
        <h2
          id="stage-intro-title"
          className="mt-3 text-2xl font-bold"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
        >
          {t('journey.intro.stageTitle', 'Stage {{number}}: {{label}}', {
            number: stage.index + 1,
            label: stage.label
          })}
        </h2>
        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--app-muted)' }}>
          {stage.tagline}
        </p>
      </div>

      <div className="mt-5 space-y-4 text-left">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            {t('journey.intro.whatTitle', 'What you learn')}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-on-surface)' }}>
            {stage.what}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            {t('journey.intro.howTitle', 'How you learn it')}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-on-surface)' }}>
            {stage.how}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            {t('journey.intro.modesTitle', 'Games in this stage')}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {stage.modes.map((gameMode) => (
              <span
                key={gameMode.id}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{
                  background: 'var(--app-surface, rgba(0,0,0,0.05))',
                  color: 'var(--app-on-surface)'
                }}
              >
                <Icon name={gameMode.icon} size={16} filled />
                {gameMode.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          className="scenic-cta btn-press w-full justify-center"
          onClick={() => {
            onClose?.();
            onStart?.();
          }}
        >
          <Icon name="play_arrow" size={20} filled />
          <span>
            {isUnlock
              ? t('journey.intro.startCta', 'Start {{label}}', { label: stage.label })
              : t('journey.intro.playCta', 'Play')}
          </span>
        </button>
        <button
          type="button"
          className="w-full rounded-xl py-2 text-sm font-semibold"
          style={{ color: 'var(--app-muted)' }}
          onClick={onClose}
        >
          {isUnlock ? t('journey.intro.laterCta', 'Maybe later') : t('common.close', 'Close')}
        </button>
      </div>
    </Modal>
  );
}
