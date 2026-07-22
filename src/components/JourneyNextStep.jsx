import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useJourney } from '../hooks/useJourney.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

/**
 * JourneyNextStep — post-session guidance block.
 *
 * Two states:
 *   1. A stage just unlocked (intro not yet seen) → "You're ready to
 *      advance" moment with a CTA straight into the new stage.
 *   2. Otherwise → live progress toward the next locked stage, so every
 *      session ends with a visible reason to come back.
 *
 * Renders nothing when the journey is complete.
 *
 * @param {Object} props
 * @param {Function} [props.onBeforeNavigate] — close the hosting overlay
 *   before navigating (e.g. PostGameReview's onHome).
 */
export default function JourneyNextStep({ onBeforeNavigate }) {
  const { stages, currentStageId, pendingIntroStage, markJourneyIntroSeen } = useJourney();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const nextLockedStage = useMemo(() => {
    const currentIndex = stages.findIndex((stage) => stage.id === currentStageId);
    return stages.slice(currentIndex + 1).find((stage) => !stage.unlocked) ?? null;
  }, [stages, currentStageId]);

  const goToStage = (stage) => {
    markJourneyIntroSeen(stage.id);
    onBeforeNavigate?.();
    navigate(stage.id === 'words' ? '/bridge' : '/read');
  };

  if (pendingIntroStage && pendingIntroStage.id !== 'letters') {
    return (
      <div
        className="rounded-2xl p-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          border: '2px solid rgba(47, 140, 87, 0.45)'
        }}
      >
        <div className="flex items-center gap-2 font-bold" style={{ color: '#1e6f42' }}>
          <span className="text-2xl" aria-hidden="true">🎉</span>
          <span>
            {t('journey.nextStep.unlockedTitle', 'You’re ready to advance: {{label}} is unlocked!', {
              label: pendingIntroStage.label
            })}
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: '#4a2208' }}>
          {pendingIntroStage.tagline}
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-full px-5 py-3 font-bold btn-press"
          style={{
            background: 'linear-gradient(135deg, #2f8c57, #1e6f42)',
            color: 'white',
            boxShadow: '0 3px 0 #175636, 0 6px 10px rgba(23, 86, 54, 0.35)'
          }}
          onClick={() => goToStage(pendingIntroStage)}
        >
          {t('journey.nextStep.startCta', 'Start {{label}}', { label: pendingIntroStage.label })}
        </button>
      </div>
    );
  }

  if (nextLockedStage) {
    return (
      <div
        className="rounded-2xl p-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '2px solid rgba(228, 155, 90, 0.4)'
        }}
      >
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#4a2208' }}>
          <Icon name={nextLockedStage.icon} size={18} filled />
          <span>
            {t('journey.nextStep.nextUp', 'Next stage: {{label}}', { label: nextLockedStage.label })}
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: '#6c3b14' }}>
          {nextLockedStage.progressLine} · {nextLockedStage.remainingLine}
        </p>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full"
          style={{ background: 'rgba(74, 34, 8, 0.12)' }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(4, nextLockedStage.unlockProgress.percent)}%`,
              background: 'linear-gradient(90deg, #2f8c57, #7bd74f)'
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}
