import React from 'react';
import { classNames } from '../lib/classNames.js';

/**
 * PlayfulContainer - A warm, bubbly container component with optional wooden header
 *
 * @param {Object} props
 * @param {'card' | 'panel' | 'wooden-header'} props.variant - Container style
 * @param {React.ReactNode} props.children - Container content
 * @param {string} props.title - Optional title for wooden-header variant
 * @param {string} props.className - Additional CSS classes
 */
export function PlayfulContainer({
  variant = 'card',
  children,
  title,
  className = '',
  ...props
}) {
  if (variant === 'wooden-header' && title) {
    return (
      <div
        className={classNames(
          'rounded-playful-xl overflow-hidden',
          'border-4 border-playful-brown-700',
          'bg-playful-cream',
          'shadow-playful-lg',
          className
        )}
        {...props}
      >
        {/* Wooden Header */}
        <div className="relative bg-gradient-to-br from-playful-brown-600 to-playful-brown-700 px-6 py-4 shadow-inner-playful">
          <h2 className="text-center text-2xl font-bold text-playful-cream sm:text-3xl">
            {title}
          </h2>
          {/* Decorative elements */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-playful-yellow-400">⭐</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-playful-yellow-400">⭐</div>
        </div>
        {/* Content */}
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    );
  }

  const variantClasses = {
    card: [
      'rounded-playful-lg',
      'border-4 border-playful-orange-200',
      'bg-white',
      'shadow-playful',
      'p-6'
    ],
    panel: [
      'rounded-playful-xl',
      'border-4 border-playful-brown-300',
      'bg-playful-beige',
      'shadow-playful-lg',
      'p-6 sm:p-8'
    ]
  };

  return (
    <div
      className={classNames(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PlayfulBadge - A small badge/pill component
 */
export function PlayfulBadge({
  variant = 'orange',
  children,
  className = '',
  ...props
}) {
  const variantClasses = {
    orange: 'bg-playful-orange-500 text-white border-2 border-playful-orange-700',
    yellow: 'bg-playful-yellow-400 text-playful-brown-900 border-2 border-playful-yellow-600',
    brown: 'bg-playful-brown-500 text-white border-2 border-playful-brown-700',
    cyan: 'bg-cyan-500 text-white border-2 border-cyan-700',
    green: 'bg-green-500 text-white border-2 border-green-700'
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-playful-sm',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
