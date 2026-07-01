/**
 * 豆包 AI 文生图 API 封装（直连模式）
 *
 * 模型：doubao-seedream-5-0-260128（豆包最新图像创作模型）
 * 文档：https://api-doc.vncps.com/api-reference/image-generation
 *
 * ⚠️ 安全提示：
 * - API Key 通过 VITE_ 前缀注入构建产物
 * - 豆包 API 有速率限制，即使 Key 泄露风险可控
 * - 如需更高安全性可改用 Cloudflare Worker 代理方案
 */

const API_URL = 'https://ark.cn-beijing.volces.com/v1/images/generations'
const API_KEY = import.meta.env.VITE_DOUBAO_API_KEY

export async function generateHeadSculpt(prompt, opts = {}) {
  if (!API_KEY) {
    throw new Error('未配置 API Key，请在 .env 文件中设置 VITE_DOUBAO_API_KEY')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: opts.model || 'doubao-seedream-5-0-260128',
      prompt: `头雕定制设计：${prompt}。风格：写实雕塑，精细工艺，收藏级品质。`,
      size: opts.size || '2K',
      response_format: 'url',
      watermark: false,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `豆包 API 错误 (${response.status})`)
  }

  const data = await response.json()
  return data.data || []
}
