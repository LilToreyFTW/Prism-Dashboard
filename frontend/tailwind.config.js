/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        prism: {
          bg: '#050713',
          panel: 'rgba(15, 23, 42, 0.68)',
          line: 'rgba(148, 163, 184, 0.20)',
          cyan: '#37d5ff',
          violet: '#a855f7',
          pink: '#f472b6'
        }
      },
      boxShadow: {
        neon: '0 0 40px rgba(55, 213, 255, 0.24)',
        violet: '0 0 50px rgba(168, 85, 247, 0.25)'
      }
    }
  },
  plugins: []
};
