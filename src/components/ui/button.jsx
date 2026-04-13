import React from 'react';

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  disabled = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    default: '',
    outline: '',
    ghost: '',
  };

  const variantStyles = {
    default: { background: 'var(--app-primary)', color: 'var(--app-on-primary)' },
    outline: { border: '1px solid var(--app-outline-variant)', background: 'var(--app-card-bg)', color: 'var(--app-on-surface)' },
    ghost: { background: 'transparent', color: 'var(--app-on-surface)' },
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
