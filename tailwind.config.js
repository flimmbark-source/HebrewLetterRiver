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
        sans: ['"Plus Jakarta Sans"', '"Nunito"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"Baloo 2"', 'system-ui', 'sans-serif']
      },
      colors: {
        // Design system: "The Fluid Sanctuary"
        ds: {
          // Core palette
          'primary': '#1b6b4f',
          'primary-container': '#a8f0cd',
          'on-primary': '#ffffff',
          'on-primary-container': '#0d3b2a',

          'secondary': '#855315',
          'secondary-container': '#ffddb3',
          'on-secondary': '#ffffff',
          'on-secondary-container': '#4a2e08',

          'tertiary': '#4a6365',
          'tertiary-container': '#cce8ea',
          'on-tertiary': '#ffffff',

          // Surfaces
          'background': '#fef7ff',
          'on-background': '#1d1b20',
          'surface': '#fef7ff',
          'on-surface': '#1d1b20',
          'on-surface-variant': '#49454f',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f7f2fa',
          'surface-container': '#f1ecf4',
          'surface-container-high': '#ece6f0',
          'surface-container-highest': '#e6e0e9',

          // Utility
          'outline': '#79747e',
          'outline-variant': '#cac4d0',
        },

        // Keep legacy arcade tokens for backwards compat during migration
        arcade: {
          'mint': '#7BFF61',
          'mint-light': '#E8FFE3',
          'aqua': '#49E5EB',
          'aqua-light': '#E0FBFD',
          'yellow': '#E7E748',
          'yellow-light': '#FDFCE5',
          'cta': '#1b6b4f',
          'cta-hover': '#155a42',
          'bg-base': '#fef7ff',
          'bg-surface': '#FFFFFF',
          'border-subtle': '#D1FAE5',
          'border-medium': '#A7F3D0',
          'text-primary': '#1d1b20',
          'text-secondary': '#49454f',
          'text-tertiary': '#79747e',
          'text-disabled': '#D1D5DB'
        }
      },
      borderRadius: {
        'ds-sm': '0.5rem',
        'ds-md': '1.5rem',
        'ds-lg': '2rem',
        'ds-xl': '3rem',
        'ds-full': '9999px',
        // Legacy
        'arcade': '16px',
        'arcade-lg': '20px',
        'arcade-button': '999px'
      },
      boxShadow: {
        // Design system: diffused, tinted shadows only
        'ds-sm': '0 2px 8px -2px rgba(29, 27, 32, 0.04)',
        'ds': '0 4px 16px -4px rgba(29, 27, 32, 0.06)',
        'ds-md': '0 8px 24px -6px rgba(29, 27, 32, 0.06)',
        'ds-lg': '0 12px 48px -8px rgba(29, 27, 32, 0.08)',
        'ds-float': '0 16px 48px -12px rgba(29, 27, 32, 0.08)',
        // Legacy
        'arcade-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'arcade-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'arcade-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade-nav': '0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      spacing: {
        'ds-1': '0.25rem',
        'ds-2': '0.5rem',
        'ds-3': '0.75rem',
        'ds-4': '1rem',
        'ds-6': '1.5rem',
        'ds-8': '2rem',
        'ds-10': '2.5rem',
        'ds-12': '3rem',
        'ds-16': '4rem',
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
