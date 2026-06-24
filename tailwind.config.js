/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        exa: { 500: '#00b9c7', 600: '#0099a8', 700: '#007a88' },
      },
    },
  },
  plugins: [],
}
