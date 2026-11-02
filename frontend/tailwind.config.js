/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f6f5fc',
          100: '#edeafd',
          200: '#dbd6fa',
          300: '#beacf4',
          400: '#9b7eeb',
          500: '#754de0',
          600: '#533bb2',
          700: '#433499',
          800: '#393186', // Primary theme color
          900: '#393186', // Primary theme color
          950: '#2a2463', // Complementary dark shade
        },
        brand: {
          purple: {
            DEFAULT: '#393186',
            50: '#f6f5fc',
            100: '#edeafd',
            200: '#dbd6fa',
            500: '#754de0',
            600: '#533bb2',
            700: '#433499',
            800: '#393186',
            900: '#393186',
            950: '#2a2463',
          },
          theme: '#393186',
          dark: '#2a2463',
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(88, 28, 135, 0.15)',
        'brand-lg': '0 10px 30px -4px rgba(88, 28, 135, 0.2)',
      }
    },
  },
  plugins: [],
}
