/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          50:  '#fdf9ee',
          100: '#f9efcf',
          200: '#f2db9a',
          300: '#e8c05f',
          400: '#dea835',
          500: '#c99020',
          600: '#a97218',
          700: '#875516',
          800: '#6f4419',
          900: '#5c3919',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(222,168,53,0.15), 0 8px 30px -12px rgba(222,168,53,0.25)',
        card: '0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.2)',
        'card-hover': '0 10px 40px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e8c05f 0%, #c99020 100%)',
        'dark-radial': 'radial-gradient(1200px 600px at 100% -10%, rgba(201,144,32,0.08), transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
