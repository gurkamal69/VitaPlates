import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: "/VitaPlates/",
  plugins: [react()],
  server: {
    proxy: {
      '/spoonacular': {
        target: 'https://api.spoonacular.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/spoonacular/, '')
      },
      '/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai/, '')
      }
    }
  }
})