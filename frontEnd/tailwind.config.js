/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-dark': 'var(--color-surface-dark)',
        'border-dark': 'var(--color-border-dark)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
      },
      fontFamily: {
        display: ['"Spline Sans"', 'sans-serif'],
        body: ['"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
