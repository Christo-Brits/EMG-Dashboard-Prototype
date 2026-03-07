import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Netlify serves from root; GitHub Pages needs the repo sub-path.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NETLIFY ? '/' : '/EMG-Dashboard-Prototype/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
