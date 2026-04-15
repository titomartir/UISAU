/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Source Serif 4"', 'serif']
      },
      colors: {
        brand: {
          50: '#f5fbf8',
          100: '#dff3ea',
          200: '#b3e4cf',
          300: '#82d2b2',
          400: '#43b98a',
          500: '#1d986c',
          600: '#147a56',
          700: '#105f45',
          800: '#0f4c38',
          900: '#0d3d2f'
        },
        accent: {
          100: '#fff3da',
          300: '#f9d68e',
          500: '#e9a93a',
          700: '#9a5b17'
        }
      },
      boxShadow: {
        soft: '0 10px 25px rgba(13, 61, 47, 0.12)'
      }
    }
  },
  plugins: []
};
