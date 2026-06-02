/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#05070c',
        panelBg: 'rgba(13, 20, 35, 0.65)',
        accentCyan: '#06b6d4',
        accentGreen: '#10b981',
        accentOrange: '#f59e0b',
        accentRed: '#ef4444',
        accentPurple: '#8b5cf6',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
