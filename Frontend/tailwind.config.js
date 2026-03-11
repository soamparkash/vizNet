/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#eef2ff',
          600: '#4f46e5',
          700: '#4338ca',
        },
        rose: {
          50: '#fff1f2',
          500: '#f43f5e',
          600: '#e11d48',
        },
        sage: '#A8B5A2',
        amber: {
          50: '#fffbeb',
          500: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
}