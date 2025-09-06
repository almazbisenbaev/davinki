// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.', // serves index.html from root
  publicDir: 'public', // if you add public assets later
  server: {
    open: true, // auto open browser
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})