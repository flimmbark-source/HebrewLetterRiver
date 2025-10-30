/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"Heebo"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        river: {
          background: '#0f172a',
          panel: '#111827',
          accent: '#22d3ee',
          accentDark: '#0ea5e9'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

