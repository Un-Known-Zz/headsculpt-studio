/**
 * 豆包 AI 文生图 API 封装（直连模式）
 *
 * 模型：doubao-seedream-5-0-260128
 * 文档：https://api-doc.vncps.com/api-reference/image-generation
 *
 * 本地开发说明：
 *   如需绕过 CORS，可在 vite.config.js 配置 proxy：
 *   proxy: { '/api/doubao': { target: 'https://ark.cn-beijing.volces.com', changeOrigin: true, rewrite: ... } }
 */

const API_URL = 'https://ark.cn-beijing.volces.com/v1/images/generations'

export async function generateHeadSculpt(prompt, opts = {}) {
  const apiKey = import.meta.env.VITE_DOUBAO_API_KEY
  if (!apiKey) {
    throw new Error('AI 服务未配置 API Key，请联系管理员')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model || 'doubao-seedream-5-0-260128',
      prompt: `头雕定制设计：${prompt}。风格：写实雕塑，精细工艺，收藏级品质。`,
      size: opts.size || '2K',
      response_format: 'url',
      watermark: false,
    }),
  })

  // 读取响应体（无论成功失败）
  const text = await response.text()

  if (!response.ok) {
    let errMsg = `豆包 API 错误 (${response.status})`
    try {
      const err = JSON.parse(text)
      errMsg = err.error?.message || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  try {
    const data = JSON.parse(text)
    return data.data || []
  } catch {
    throw new Error('API 返回数据格式异常，请稍后重试')
  }
}
