import React from 'react';
import { classNames } from '../lib/classNames.js';

/**
 * PlayfulButton - A bubbly 3D button component inspired by modern game UI
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'orange' | 'yellow' | 'green' | 'red'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 */
export function PlayfulButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = [
    'font-bold',
    'transition-all duration-150',
    'border-b-4',
    'focus:outline-none focus:ring-4 focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
    'active:translate-y-1 active:border-b-2'
  ];

  const variantClasses = {
    primary: [
      'bg-playful-orange-500 hover:bg-playful-orange-400',
      'border-playful-orange-700',
      'text-white',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-orange-300'
    ],
    secondary: [
      'bg-playful-yellow-400 hover:bg-playful-yellow-300',
      'border-playful-yellow-600',
      'text-playful-brown-900',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-yellow-200'
    ],
    orange: [
      'bg-playful-orange-500 hover:bg-playful-orange-400',
      'border-playful-orange-700',
      'text-white',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-orange-300'
    ],
    yellow: [
      'bg-playful-yellow-400 hover:bg-playful-yellow-300',
      'border-playful-yellow-600',
      'text-playful-brown-900',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-yellow-200'
    ],
    green: [
      'bg-green-500 hover:bg-green-400',
      'border-green-700',
      'text-white',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-green-300'
    ],
    red: [
      'bg-playful-red-500 hover:bg-playful-red-400',
      'border-playful-red-600',
      'text-white',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-red-300'
    ]
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-playful',
    md: 'px-6 py-3 text-base rounded-playful-lg',
    lg: 'px-8 py-4 text-lg rounded-playful-lg',
    xl: 'px-10 py-5 text-xl rounded-playful-xl'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * PlayfulIconButton - A rounded icon-only button with 3D effect
 */
export function PlayfulIconButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  const baseClasses = [
    'rounded-full',
    'transition-all duration-150',
    'border-b-4',
    'flex items-center justify-center',
    'focus:outline-none focus:ring-4 focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
    'active:translate-y-1 active:border-b-2'
  ];

  const variantClasses = {
    primary: [
      'bg-playful-orange-500 hover:bg-playful-orange-400',
      'border-playful-orange-700',
      'text-white',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-orange-300'
    ],
    secondary: [
      'bg-playful-yellow-400 hover:bg-playful-yellow-300',
      'border-playful-yellow-600',
      'text-playful-brown-900',
      'shadow-playful hover:shadow-playful-sm',
      'focus:ring-playful-yellow-200'
    ]
  };

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
