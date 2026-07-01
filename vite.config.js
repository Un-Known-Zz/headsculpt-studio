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
    // 本地开发代理：将 /api/doubao 转发到豆包 API，绕过浏览器 CORS 限制
    proxy: {
      '/api/doubao': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doubao/, '/v1/images/generations'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const apiKey = process.env.VITE_DOUBAO_API_KEY || ''
            proxyReq.setHeader('Authorization', `Bearer ${apiKey}`)
            proxyReq.setHeader('Content-Type', 'application/json')
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
