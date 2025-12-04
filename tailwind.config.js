/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // Cyan 500
        secondary: '#64748B', // Slate 500
      }
    },
  },
  plugins: [],
}
