/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // Game font classes - dynamically generated, so must be safelisted
    'game-font-default',
    'game-font-lexend',
    'game-font-opendyslexic',
    'game-font-comic-sans',
    'game-font-arial',
    'game-font-verdana',
    // Hebrew font shuffle classes - also dynamically generated
    'game-font-frank-ruhl',
    'game-font-noto-serif',
    'game-font-taamey-frank',
    'game-font-ezra-sil',
    'game-font-keter-yg'
  ],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"Heebo"', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
        heading: ['"Baloo 2"', 'system-ui', 'sans-serif']
      },
      colors: {
        arcade: {
          // Modern color system with clear hierarchy
          // Primary accent - Canary Yellow (progress, success, highlights)
          'accent': '#E7E748',
          'accent-hover': '#d4d43f',

          // CTA color - Sky Surge (buttons, interactive elements)
          'cta': '#4AC2DD',
          'cta-hover': '#3ab0c4',

          // Supporting colors (use sparingly)
          'success': '#63D052',
          'info': '#49E5EB',

          // Neutral backgrounds
          'bg-base': '#FAFAFA',
          'bg-surface': '#FFFFFF',
          'bg-elevated': '#FFFFFF',

          // Borders
          'border-subtle': '#E5E7EB',
          'border-medium': '#D1D5DB',

          // Text hierarchy
          'text-primary': '#1F2937',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          'text-disabled': '#D1D5DB'
        }
      },
      boxShadow: {
        // Neutral gray shadows only - modern, crisp elevation
        'arcade-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'arcade-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'arcade-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade-nav': '0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        'arcade': '16px',
        'arcade-lg': '20px',
        'arcade-button': '999px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

