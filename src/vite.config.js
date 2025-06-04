import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/vitaplates/",
  plugins: [react()],
  build: {
    outDir: 'dish'  // Add this line to output build to 'dish'
  },
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
