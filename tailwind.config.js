/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"Heebo"', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
        heading: ['"Baloo 2"', 'system-ui', 'sans-serif']
      },
      colors: {
        arcade: {
          // Background gradients
          'bg-outer-1': '#f8c792',
          'bg-outer-2': '#f6a66c',
          'bg-shell': '#ffe9c9',

          // Panel colors
          'panel-light': '#fff5dd',
          'panel-medium': '#ffe2b8',
          'panel-border': '#e49b5a',

          // Wood colors
          'wood-dark': '#aa622d',
          'wood-mid': '#c97932',
          'wood-light': '#f2b15b',

          // Accent colors
          'accent-orange': '#ff9247',
          'accent-orange-deep': '#f46a2b',
          'accent-red': '#ff5a4f',
          'accent-green': '#5acb5a',
          'accent-gold': '#ffce4a',

          // Text colors
          'text-main': '#4a2208',
          'text-soft': '#6c3b14',
          'text-muted': '#b07737'
        }
      },
      boxShadow: {
        'arcade-sm': '0 3px 0 rgba(133, 63, 21, 1), 0 6px 10px rgba(133, 63, 21, 0.7)',
        'arcade': '0 4px 0 rgba(176, 104, 38, 1), 0 8px 12px rgba(176, 104, 38, 0.7)',
        'arcade-md': '0 4px 0 rgba(214, 140, 64, 1), 0 8px 16px rgba(255, 146, 71, 0.6)',
        'arcade-lg': '0 5px 0 #d86a2a, 0 10px 14px rgba(216, 106, 42, 0.85)',
        'arcade-pill': '0 3px 0 rgba(176, 104, 38, 1), 0 6px 10px rgba(176, 104, 38, 0.7)',
        'arcade-card': '0 8px 14px rgba(199, 124, 52, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.8)',
        'arcade-button': '0 4px 0 #c85a24, 0 7px 12px rgba(200, 90, 36, 0.7)',
        'arcade-frame': '0 18px 36px rgba(169, 77, 21, 0.7), 0 0 0 2px rgba(255, 255, 255, 0.6)'
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

