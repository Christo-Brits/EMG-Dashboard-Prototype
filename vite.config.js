import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Netlify serves from root; GitHub Pages needs the repo sub-path.
export default defineConfig({
  plugins: [react()],
  base: process.env.NETLIFY ? '/' : '/EMG-Dashboard-Prototype/',
})
