import React from 'react';

/**
 * Reusable skeleton loading placeholder.
 *
 * @param {object} props
 * @param {string|number} [props.width]   - CSS width  (default '100%')
 * @param {string|number} [props.height]  - CSS height (default '1em')
 * @param {'text'|'circle'|'card'|'rect'} [props.variant] - Shape variant
 * @param {string} [props.className] - Additional CSS classes
 */
export default function Skeleton({
  width = '100%',
  height = '1em',
  variant = 'rect',
  className = '',
}) {
  const variantClass =
    variant === 'circle'
      ? 'skeleton--circle'
      : variant === 'text'
        ? 'skeleton--text'
        : '';

  const radiusStyle =
    variant === 'card' ? { borderRadius: '16px' } : {};

  return (
    <div
      className={`skeleton ${variantClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...radiusStyle,
      }}
      aria-hidden="true"
    />
  );
}
