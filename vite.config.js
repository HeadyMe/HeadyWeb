import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [
      'headysystems.com',
      'www.headysystems.com',
      'web.headysystems.com',
      'headyconnection.org',
      'web.headyconnection.org',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: './public/index.html'
    }
  }
})
