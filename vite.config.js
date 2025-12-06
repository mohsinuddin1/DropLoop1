import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This ensures all routes fallback to index.html for client-side routing
    // Fixes 404 errors when refreshing on routes like /posts/123
    historyApiFallback: true,
  },
  preview: {
    // Same for preview/production builds
    historyApiFallback: true,
  },
})
