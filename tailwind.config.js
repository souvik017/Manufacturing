/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          teal: '#017e84',
          dark: '#2c2c2c',
          amber: '#e8a825',
          red: '#e04c4c',
          purple: '#714b67',
        }
      }
    },
  },
  plugins: [],
}
