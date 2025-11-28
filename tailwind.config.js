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
        },
        // Playful color palette inspired by the reference image
        playful: {
          cream: '#FFF5E1',
          beige: '#F5E6D3',
          orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12'
          },
          yellow: {
            50: '#FEFCE8',
            100: '#FEF9C3',
            200: '#FEF08A',
            300: '#FDE047',
            400: '#FACC15',
            500: '#EAB308',
            600: '#CA8A04',
            700: '#A16207',
            800: '#854D0E',
            900: '#713F12'
          },
          brown: {
            50: '#F5F3F0',
            100: '#E8E4DE',
            200: '#D4C9BD',
            300: '#BAAA95',
            400: '#9E8770',
            500: '#8B7355',
            600: '#6F5A44',
            700: '#584637',
            800: '#3D2F24',
            900: '#2A1F17'
          },
          red: {
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626'
          }
        }
      },
      boxShadow: {
        'playful-sm': '0 2px 0 0 rgba(0, 0, 0, 0.3)',
        'playful': '0 4px 0 0 rgba(0, 0, 0, 0.3)',
        'playful-lg': '0 6px 0 0 rgba(0, 0, 0, 0.3)',
        'playful-xl': '0 8px 0 0 rgba(0, 0, 0, 0.3)',
        'inner-playful': 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
      },
      borderRadius: {
        'playful': '20px',
        'playful-lg': '28px',
        'playful-xl': '36px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

