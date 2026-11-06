/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#070c18',
          900: '#0d1527',
          850: '#111b33',
          800: '#162342',
          750: '#1c2d54',
          700: '#223867',
          600: '#2d4b8a',
          500: '#3b66bd',
          400: '#5a86db',
          300: '#8baaf0',
          200: '#bfd2fa',
          100: '#e1eafc',
        },
      },
    },
  },
  plugins: [],
}
