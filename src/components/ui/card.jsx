import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-lg shadow-sm ${className}`}
      style={{
        background: 'var(--app-card-bg)',
        border: '1px solid var(--app-card-border)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      style={{ color: 'var(--app-on-surface)' }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
