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
          // Vibrant colorful palette - modern & playful
          'mint': '#7BFF61',
          'mint-light': '#E8FFE3',
          'aqua': '#49E5EB',
          'aqua-light': '#E0FBFD',
          'yellow': '#E7E748',
          'yellow-light': '#FDFCE5',

          // Primary CTA
          'cta': '#4AC2DD',
          'cta-hover': '#3ab0c4',

          // Neutral backgrounds with color tints
          'bg-base': '#F0FFF4', // Very light mint tint
          'bg-surface': '#FFFFFF',

          // Borders - colorful but subtle
          'border-subtle': '#D1FAE5',
          'border-medium': '#A7F3D0',

          // Text hierarchy
          'text-primary': '#064E3B', // Dark green for contrast
          'text-secondary': '#065F46',
          'text-tertiary': '#059669',
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

