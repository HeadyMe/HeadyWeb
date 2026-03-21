import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getAllowedHosts } from './src/heady-registry.js'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: getAllowedHosts()
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
