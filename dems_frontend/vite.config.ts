import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': { target: backend, changeOrigin: true },
      '/me': { target: backend, changeOrigin: true },
      '/users': { target: backend, changeOrigin: true },
      '/cases': { target: backend, changeOrigin: true },
      '/evidence': { target: backend, changeOrigin: true },
      '/custody': { target: backend, changeOrigin: true },
      '/audit': { target: backend, changeOrigin: true },
    },
  },
})
