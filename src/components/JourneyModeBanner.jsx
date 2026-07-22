import React from 'react';
import Icon from './Icon.jsx';
import { useJourney } from '../hooks/useJourney.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

/**
 * JourneyModeBanner — one-line strip shown at the top of a mode's setup
 * screen, placing that mode on the learning journey:
 *
 *   "Stage 2 of 4 · Words — Pronounce & build vocabulary"
 *
 * For reinforcement modes (Deep Script, Daily Review) pass
 * `reinforcement` copy instead of a stageId.
 */
export default function JourneyModeBanner({ stageId, className = '' }) {
  const { stages } = useJourney();
  const { t } = useLocalization();
  const stage = stages.find((item) => item.id === stageId);
  if (!stage) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${className}`}
      style={{
        background: 'var(--app-surface, rgba(46, 143, 189, 0.1))',
        color: 'var(--app-on-surface, #102f25)',
        border: '1px solid var(--app-card-border, rgba(46, 143, 189, 0.18))'
      }}
    >
      <Icon name={stage.icon} size={16} filled />
      <span>
        {t('journey.banner.stage', 'Stage {{number}} of {{total}} · {{label}}', {
          number: stage.index + 1,
          total: stages.length,
          label: stage.label
        })}
        <span style={{ fontWeight: 600, color: 'var(--app-muted, rgba(16,47,37,0.7))' }}>
          {' '}— {stage.tagline}
        </span>
      </span>
    </div>
  );
}
