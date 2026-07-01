/**
 * 豆包 AI 文生图 API 封装
 * 文档：https://www.volcengine.com/docs/82379
 */

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'

export async function generateHeadSculpt(prompt, opts = {}) {
  const apiKey = import.meta.env.VITE_DOUBAO_API_KEY

  if (!apiKey) {
    throw new Error('未配置豆包 AI API Key，请在 .env 文件中设置 VITE_DOUBAO_API_KEY')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model || 'doubao-image-generation-v2',
      prompt: `头雕定制设计：${prompt}。风格：写实雕塑，精细工艺，收藏级品质。`,
      size: opts.size || '1024x1024',
      num: opts.num || 1,
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API 请求失败 (${response.status})`)
  }

  const data = await response.json()
  return data.data || []
}
