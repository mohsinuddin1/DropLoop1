/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // Cyan 500
        secondary: '#64748B', // Slate 500
        accent: '#8b5cf6', // Purple 500
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        border: '#e2e8f0',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'animation-delay-2000': 'blob 7s infinite 2s',
        'animation-delay-4000': 'blob 7s infinite 4s',
      },
    },
  },
  plugins: [],
}
