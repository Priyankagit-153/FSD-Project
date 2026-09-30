/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        college: {
          50: '#f0f6fe',
          100: '#ddecfd',
          200: '#c2ddfb',
          300: '#98c6f7',
          400: '#67a6f2',
          500: '#4383eb',
          600: '#2d65de',
          700: '#1d4ecb',
          800: '#1e40a4',
          900: '#1e3882',
          950: '#162450',
        }
      }
    },
  },
  plugins: [],
}
