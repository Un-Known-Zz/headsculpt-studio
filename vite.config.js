import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import extractVideoThumbs from './scripts/extract-thumbs-plugin.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
      // 本地开发代理：将 /api/modelscope 转发到魔搭 API，绕过浏览器 CORS 限制
      proxy: {
        '/api/modelscope': {
          target: 'https://api-inference.modelscope.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/modelscope/, ''),
          configure: (proxy) => {
            // 自动注入 Authorization header（从 .env 读取 Token）
            const token = env.VITE_MODELSCOPE_API_TOKEN || ''
            if (token) {
              proxy.on('proxyReq', (proxyReq) => {
                proxyReq.setHeader('Authorization', `Bearer ${token}`)
              })
            }
          },
        },
        // 保留旧配置备用
        '/api/doubao': {
          target: 'https://ark.cn-beijing.volces.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/doubao/, '/v1/images/generations'),
          configure: (proxy) => {
            const apiKey = env.VITE_DOUBAO_API_KEY || ''
            proxy.on('proxyReq', (proxyReq, req) => {
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
  }
})
