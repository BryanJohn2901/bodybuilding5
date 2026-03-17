/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000000',
        'brand-night': '#050505',
        'brand-navy': '#02060D',
        'brand-darkgray': '#121212',
        'brand-anthracite': '#1A1A1A',
        'brand-gray-600': '#4B5563',
        'brand-gray-500': '#6B7280',
        'brand-gray-400': '#9CA3AF',
        'brand-gray-300': '#D1D5DB',
        'brand-gray-200': '#E5E7EB',
        'brand-primary': '#DC2626',
        'brand-accent': '#B91C1C',
        'brand-success': '#22C55E',
        'brand-bg': '#050505',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('../img/bgHeroAtualizado.webp')",
        'hero-mobile': "url('../img/bgHeroMobileAtualizado.webp')",
        'texture-pattern': "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
