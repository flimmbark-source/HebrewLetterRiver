import React from 'react';
import Icon from './Icon.jsx';

export default function LetterRiverBrand({
  label,
  className = '',
  iconClassName = '',
  textClassName = '',
  filled = true,
}) {
  return (
    <div className={className} aria-label={label || 'Letter River'}>
      <Icon
        name="waves"
        className={iconClassName}
        size={28}
        filled={filled}
      />
      <span className={textClassName}>{label || 'Letter River'}</span>
    </div>
  );
}
