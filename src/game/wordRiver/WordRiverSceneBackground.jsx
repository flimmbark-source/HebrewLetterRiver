import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../lib/classNames.js';

function KitchenBackground({ className }) {
  return (
    <svg
      viewBox="0 0 960 540"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="kitchen-wall" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(15,118,110,0.55)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0.95)" />
        </linearGradient>
        <linearGradient id="kitchen-counter" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(148,163,184,0.9)" />
          <stop offset="100%" stopColor="rgba(71,85,105,0.95)" />
        </linearGradient>
        <linearGradient id="kitchen-cabinet" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(94,234,212,0.15)" />
          <stop offset="100%" stopColor="rgba(14,165,233,0.15)" />
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#kitchen-wall)" />
      <rect x="0" y="360" width="960" height="140" fill="url(#kitchen-counter)" opacity="0.85" />
      <rect x="40" y="120" width="880" height="160" rx="28" fill="url(#kitchen-cabinet)" opacity="0.85" />
      <g opacity="0.45">
        <rect x="80" y="140" width="120" height="120" rx="18" fill="rgba(148,163,184,0.3)" />
        <rect x="240" y="140" width="160" height="120" rx="18" fill="rgba(148,163,184,0.35)" />
        <rect x="440" y="140" width="180" height="120" rx="18" fill="rgba(94,234,212,0.25)" />
        <rect x="660" y="140" width="180" height="120" rx="18" fill="rgba(94,234,212,0.25)" />
      </g>
      <g opacity="0.25">
        <path
          d="M120 360c0-30 20-50 48-50h108c28 0 48 20 48 50"
          stroke="rgba(148,163,184,0.55)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M460 360c0-30 20-50 48-50h148c28 0 48 20 48 50"
          stroke="rgba(148,163,184,0.55)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g opacity="0.3" fill="none" stroke="rgba(125,211,252,0.28)" strokeWidth="4">
        <rect x="120" y="32" width="120" height="70" rx="12" />
        <rect x="300" y="48" width="140" height="54" rx="16" />
        <rect x="720" y="60" width="160" height="48" rx="16" />
      </g>
      <g opacity="0.18" stroke="rgba(226,232,240,0.45)">
        <line x1="40" x2="920" y1="320" y2="320" strokeWidth="8" strokeLinecap="round" />
        <line x1="40" x2="920" y1="332" y2="332" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

KitchenBackground.propTypes = {
  className: PropTypes.string
};

const BACKGROUND_COMPONENTS = {
  kitchen: KitchenBackground
};

export default function WordRiverSceneBackground({ backgroundId }) {
  const BackgroundComponent = useMemo(() => BACKGROUND_COMPONENTS[backgroundId] ?? null, [backgroundId]);

  return (
    <div
      className={classNames(
        'word-river-scene-background-art',
        'absolute inset-0 flex items-center justify-center'
      )}
    >
      {BackgroundComponent ? <BackgroundComponent className="h-full w-full" /> : null}
    </div>
  );
}

WordRiverSceneBackground.propTypes = {
  backgroundId: PropTypes.string.isRequired
};
