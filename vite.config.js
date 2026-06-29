import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import extractVideoThumbs from './scripts/extract-thumbs-plugin.js'

export default defineConfig({
  base: '/headsculpt-studio/',
  plugins: [vue(), extractVideoThumbs()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
