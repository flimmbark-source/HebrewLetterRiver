import React from 'react';
import { PROGRESS_TERMS, getMasteryLevel, masteryFromSRS } from '../lib/progressTerms.js';

/**
 * PATH-04: Mastery Indicators
 *
 * Small inline badge showing mastery level of a letter or word.
 *
 * Props (choose one source):
 *   - accuracy (0-100) + attempts  -> compute level internally
 *   - srsMaturity ('new'|'learning'|'young'|'mature')
 *   - level ('weak'|'growing'|'strong'|'mastered') -> direct override
 */

const BG_MAP = {
  weak:     'rgba(229, 115, 115, 0.15)',
  growing:  'rgba(255, 183, 77, 0.15)',
  strong:   'rgba(129, 199, 132, 0.15)',
  mastered: 'rgba(212, 160, 23, 0.15)'
};

export default function MasteryBadge({ accuracy, attempts, srsMaturity, level: levelOverride }) {
  let level;
  if (levelOverride) {
    level = levelOverride;
  } else if (srsMaturity) {
    level = masteryFromSRS(srsMaturity);
  } else {
    level = getMasteryLevel(accuracy ?? 0, attempts ?? 0);
  }

  const spec = PROGRESS_TERMS.mastery[level] ?? PROGRESS_TERMS.mastery.weak;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-tight whitespace-nowrap"
      style={{
        background: BG_MAP[level] ?? BG_MAP.weak,
        color: spec.color
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: spec.color,
          flexShrink: 0
        }}
      />
      {spec.label}
    </span>
  );
}
