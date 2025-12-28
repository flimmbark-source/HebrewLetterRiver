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
          // New vibrant color palette
          'lime-green': '#63D052',
          'mint-glow': '#7BFF61',
          'sky-surge': '#4AC2DD',
          'canary-yellow': '#E7E748',
          'electric-aqua': '#49E5EB',

          // Background gradients - using new palette
          'bg-outer-1': '#7BFF61',
          'bg-outer-2': '#63D052',
          'bg-shell': '#E7E748',

          // Panel colors - using new palette
          'panel-light': '#E7E748',
          'panel-medium': '#7BFF61',
          'panel-border': '#4AC2DD',

          // Accent colors - new palette
          'accent-primary': '#7BFF61',
          'accent-secondary': '#4AC2DD',
          'accent-tertiary': '#E7E748',
          'accent-green': '#63D052',
          'accent-cyan': '#49E5EB',

          // Text colors - darker versions for contrast
          'text-main': '#1a4d14',
          'text-soft': '#2d6626',
          'text-muted': '#4a8040'
        }
      },
      boxShadow: {
        // Modern beautiful shadows - soft, layered approach
        'arcade-sm': '0 1px 2px 0 rgba(74, 194, 221, 0.05), 0 1px 3px 0 rgba(74, 194, 221, 0.1)',
        'arcade': '0 4px 6px -1px rgba(99, 208, 82, 0.1), 0 2px 4px -1px rgba(99, 208, 82, 0.06)',
        'arcade-md': '0 10px 15px -3px rgba(74, 194, 221, 0.1), 0 4px 6px -2px rgba(74, 194, 221, 0.05)',
        'arcade-lg': '0 20px 25px -5px rgba(99, 208, 82, 0.1), 0 10px 10px -5px rgba(99, 208, 82, 0.04)',
        'arcade-pill': '0 4px 6px -1px rgba(123, 255, 97, 0.1), 0 2px 4px -1px rgba(123, 255, 97, 0.06)',
        'arcade-card': '0 10px 20px -5px rgba(74, 194, 221, 0.15), 0 4px 6px -2px rgba(74, 194, 221, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5)',
        'arcade-button': '0 4px 6px -1px rgba(231, 231, 72, 0.15), 0 2px 4px -1px rgba(231, 231, 72, 0.1), 0 -2px 0 0 rgba(99, 208, 82, 0.2) inset',
        'arcade-frame': '0 25px 50px -12px rgba(73, 229, 235, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4)'
      },
      borderRadius: {
        'arcade': '20px',
        'arcade-lg': '24px',
        'arcade-xl': '30px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

