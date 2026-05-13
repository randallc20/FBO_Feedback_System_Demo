/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        gold: '#C9A84C',
        'light-bg': '#F4F6FC',
        'dark-surface': '#111E30',
        'text-primary': '#1A1F2E',
        'text-secondary': '#5A6478',
        success: '#1A6B3C',
        warning: '#BA7517',
        danger: '#A32D2D',
        blue: '#378ADD',
        teal: '#1D9E75',
        'score-green': 'var(--score-green)',
        'score-amber': 'var(--score-amber)',
        'score-red': 'var(--score-red)',
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
      },
    },
  },
  plugins: [],
};
