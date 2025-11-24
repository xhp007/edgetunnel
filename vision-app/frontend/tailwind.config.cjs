/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#030712',
          800: '#0f172a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
