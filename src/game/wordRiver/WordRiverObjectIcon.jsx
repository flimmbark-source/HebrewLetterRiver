import React from 'react';
import PropTypes from 'prop-types';

function CupIcon({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="cup-body" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="70" height="60" rx="12" fill="url(#cup-body)" />
      <rect x="35" y="75" width="40" height="8" rx="4" fill="#9ca3af" />
      <path d="M90 38c14 0 22 10 22 20s-8 20-22 20" fill="none" stroke="#d1d5db" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function MilkIcon({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="milk-bottle" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path
        d="M45 20h30l10 18v58c0 8-6 14-14 14H49c-8 0-14-6-14-14V38z"
        fill="url(#milk-bottle)"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M45 42h40" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 82h26" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function BreadIcon({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id="bread-body" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f5d0c5" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M20 60c0-20 18-36 40-36s40 16 40 36v24c0 10-8 18-18 18H38c-10 0-18-8-18-18z"
        fill="url(#bread-body)"
        stroke="#c2410c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M40 54c0 6-4 10-10 10" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 50c0 6-4 12-10 12" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 54c0 6-4 10-10 10" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const ICON_COMPONENTS = {
  cup: CupIcon,
  milk: MilkIcon,
  bread: BreadIcon
};

export default function WordRiverObjectIcon({ svgId, className = '' }) {
  const IconComponent = ICON_COMPONENTS[svgId];
  if (!IconComponent) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-3xl bg-slate-700/40 text-5xl ${className}`}
        aria-hidden="true"
      >
        ❔
      </div>
    );
  }
  return <IconComponent className={className} />;
}

WordRiverObjectIcon.propTypes = {
  svgId: PropTypes.string.isRequired,
  className: PropTypes.string
};

CupIcon.propTypes = {
  className: PropTypes.string
};

MilkIcon.propTypes = {
  className: PropTypes.string
};

BreadIcon.propTypes = {
  className: PropTypes.string
};
