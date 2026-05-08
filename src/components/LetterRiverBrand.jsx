import React from 'react';

export default function LetterRiverBrand({
  label,
  className = '',
  iconClassName = '',
  textClassName = '',
  filled = true,
}) {
  return (
    <div className={className} aria-label={label || 'Letter River'}>
      <span
        className={`material-symbols-outlined ${iconClassName}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
        aria-hidden="true"
      >
        waves
      </span>
      <span className={textClassName}>{label || 'Letter River'}</span>
    </div>
  );
}
