/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        instagram: {
          blue: '#0095f6',
          red: '#ed4956',
          gray: '#8e8e93',
          'light-gray': '#fafafa',
          border: '#dbdbdb',
        },
      },
      fontFamily: {
        instagram: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
