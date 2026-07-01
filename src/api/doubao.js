/**
 * 豆包 AI 文生图 API 封装（通过 Cloudflare Worker 代理）
 *
 * 模型：doubao-seedream-5-0-260128（豆包最新图像创作模型）
 *
 * ⚠️ 为什么需要代理？
 * 浏览器有 CORS 安全策略，GitHub Pages 域名无法直接请求豆包 API
 * 通过 Cloudflare Worker 中转，绕过 CORS 限制，同时隐藏 API Key
 *
 * Worker 代码：/cloudflare-worker/worker.js
 */

const WORKER_URL = import.meta.env.VITE_API_WORKER_URL

export async function generateHeadSculpt(prompt, opts = {}) {
  if (!WORKER_URL) {
    throw new Error('AI 服务未配置，请联系管理员')
  }

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: opts.model || 'doubao-seedream-5-0-260128',
      size: opts.size || '2K',
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `服务暂时不可用 (${response.status})`)
  }

  const data = await response.json()
  return data.data || []
}
