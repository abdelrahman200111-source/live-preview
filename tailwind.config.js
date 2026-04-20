/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C6A25A',
        'gold-dark': '#A07830',
        brand: '#1a1a1a',
        surface: '#F8F6F1',
        border: '#E8E4DC',
        bg: '#FBFBFB',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        vibes: ['"Great Vibes"', 'cursive'],
      },
    },
  },
  plugins: [],
}
