/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#F0EDFF',
          100: '#DDD6FE',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#6C5CE7',
          600: '#5B4BD5',
          700: '#4C3CC0',
          800: '#3D2E9E',
          900: '#2E2080',
        },
        success: {
          50: '#E6FFF8',
          100: '#B2F0DE',
          200: '#80E0C6',
          300: '#4DD0AE',
          400: '#26C49D',
          500: '#00B894',
          600: '#00A383',
          700: '#008E72',
          800: '#007A62',
          900: '#006652',
        },
        danger: {
          50: '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFADAD',
          300: '#FF8585',
          400: '#FF6B6B',
          500: '#FF5252',
          600: '#E63E3E',
          700: '#CC2A2A',
          800: '#B31A1A',
          900: '#990F0F',
        },
        warning: {
          50: '#FFF9E6',
          100: '#FFEFB3',
          200: '#FFE580',
          300: '#FDDB4D',
          400: '#FDCB6E',
          500: '#F0B429',
          600: '#D69E00',
          700: '#B8860B',
          800: '#9A7200',
          900: '#7C5E00',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        display: ['DM Sans', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
