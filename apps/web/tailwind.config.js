/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        background: 'var(--page)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        primary: { 400: 'var(--accent)', 500: 'var(--accent-strong)' },
      },
      animation: {
        'fade-in': 'fadeIn .3s ease-out',
        'slide-up': 'slideUp .4s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
