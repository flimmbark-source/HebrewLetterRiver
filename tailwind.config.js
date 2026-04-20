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
        hebrew: ['"Heebo"', '"Noto Sans Hebrew"', 'sans-serif'],
        'hebrew-serif': ['"Frank Ruhl Libre"', '"Noto Serif Hebrew"', 'serif'],
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Baloo 2"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        heading: ['"Baloo 2"', 'system-ui', 'sans-serif']
      },
      colors: {
        // Letter River brand scales — see src/colors_and_type.css.
        lr: {
          green: {
            50:  '#eafaf1',
            100: '#cdf0dc',
            200: '#a8e6c4',
            300: '#6fd6a1',
            400: '#3ebe80',
            500: '#1ea46a',
            600: '#1a7a55',
            700: '#145e42',
            800: '#0f4a33',
            900: '#083022'
          },
          amber: {
            50:  '#fff8e8',
            100: '#ffecbd',
            200: '#fcd888',
            300: '#f5b94a',
            400: '#ed9c1c',
            500: '#c07a10',
            600: '#9a5f0b',
            700: '#734508'
          },
          coral: {
            50:  '#fff0ec',
            100: '#ffd5cb',
            200: '#ffb09d',
            300: '#ff8466',
            400: '#f15a3a',
            500: '#d94424',
            600: '#b13519'
          },
          aqua: {
            50:  '#e6fbfd',
            100: '#b8ecf4',
            200: '#7dd8e4',
            300: '#4ac2dd',
            400: '#2aa5c4',
            500: '#0d7a8a'
          },
          violet: {
            50:  '#f3edff',
            100: '#e2d6f8',
            200: '#c3a8f0',
            300: '#9a72e0',
            400: '#7040b8',
            500: '#522b8c'
          },
          cobalt: {
            50:  '#eaf1ff',
            100: '#c8d8f8',
            200: '#8ea8e8',
            300: '#547dd8',
            400: '#2d5ccc',
            500: '#1f4099'
          },
          paper:  '#faf7f0',
          'paper-2': '#f3efe4',
          sand: {
            50:  '#f0ece4',
            100: '#e7e0d0',
            200: '#d6cdb6',
            300: '#c8bfae',
            400: '#9a8e7e'
          },
          ink: {
            500: '#7a6f5f',
            600: '#4a3f30',
            700: '#2c2418',
            900: '#120f08'
          }
        },
        // Mode accents (one color per game mode).
        mode: {
          river:  'var(--mode-river)',
          bridge: 'var(--mode-bridge)',
          planks: 'var(--mode-planks)',
          deep:   'var(--mode-deep)',
          vocab:  'var(--mode-vocab)'
        },
        // Semantic tokens (resolve to the active theme — light or dark).
        surface: {
          DEFAULT: 'var(--bg-surface)',
          alt:     'var(--bg-surface-alt)',
          sunk:    'var(--bg-surface-sunk)'
        },
        ink: {
          DEFAULT: 'var(--fg-1)',
          muted:   'var(--fg-2)',
          faint:   'var(--fg-3)'
        },
        brand: {
          primary:         'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-soft':  'var(--brand-primary-soft)',
          secondary:       'var(--brand-secondary)',
          'secondary-soft':'var(--brand-secondary-soft)',
          accent:          'var(--brand-accent)'
        },
        // Kept for existing components that still reference the arcade scale.
        arcade: {
          'mint': '#7BFF61',
          'mint-light': '#E8FFE3',
          'aqua': '#49E5EB',
          'aqua-light': '#E0FBFD',
          'yellow': '#E7E748',
          'yellow-light': '#FDFCE5',
          'cta': '#4AC2DD',
          'cta-hover': '#3ab0c4',
          'bg-base': '#F0FFF4',
          'bg-surface': '#FFFFFF',
          'border-subtle': '#D1FAE5',
          'border-medium': '#A7F3D0',
          'text-primary': '#064E3B',
          'text-secondary': '#065F46',
          'text-tertiary': '#059669',
          'text-disabled': '#D1D5DB'
        }
      },
      boxShadow: {
        // Warm, green-tinted elevation from the Letter River design system.
        'lr-xs': '0 1px 2px rgba(30, 60, 45, 0.06)',
        'lr-sm': '0 1px 3px rgba(30, 60, 45, 0.08), 0 1px 2px rgba(30, 60, 45, 0.05)',
        'lr-md': '0 4px 10px rgba(30, 60, 45, 0.09), 0 2px 4px rgba(30, 60, 45, 0.05)',
        'lr-lg': '0 12px 24px rgba(30, 60, 45, 0.10), 0 4px 8px rgba(30, 60, 45, 0.06)',
        'lr-xl': '0 24px 48px rgba(30, 60, 45, 0.12), 0 8px 16px rgba(30, 60, 45, 0.07)',
        'lr-cta': '0 2px 0 rgba(15, 74, 51, 0.18), 0 6px 16px rgba(26, 122, 85, 0.28)',
        // Preserved arcade shadows for existing components.
        'arcade-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'arcade-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'arcade-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'arcade-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'arcade-nav': '0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        // Letter River radius scale.
        'lr-xs':   '6px',
        'lr-sm':   '10px',
        'lr-md':   '14px',
        'lr-lg':   '20px',
        'lr-xl':   '28px',
        'lr-pill': '999px',
        // Existing arcade radii.
        'arcade': '16px',
        'arcade-lg': '20px',
        'arcade-button': '999px'
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '220ms',
        'slow': '400ms'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
