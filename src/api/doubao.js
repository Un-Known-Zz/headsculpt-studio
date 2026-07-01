/**
 * 魔搭 Z-Image-Turbo 文生图 API 封装
 *
 * 认证：Header 携带 MODELSCOPE_API_TOKEN 环境变量（Vite 注入）
 * 端点：https://api-inference.modelscope.cn/v1/images/generations
 * 免费额度：2000次/天，国内直连无 CORS 问题
 */

const API_URL = 'https://api-inference.modelscope.cn/v1/images/generations'
const TOKEN = import.meta.env.VITE_MODELSCOPE_API_TOKEN

export async function generateHeadSculpt(prompt, opts = {}) {
  if (!TOKEN) {
    throw new Error('AI 服务未配置，请联系管理员')
  }

  const sizeMap = {
    '1:1':  '1024x1024',
    '16:9': '2048x1152',
    '9:16': '1152x2048',
    '4:3':  '2048x1536',
    '3:4':  '1536x2048',
    '2:3':  '1365x2048',
  }
  const size = sizeMap[opts.ratio] || opts.size || '1024x1024'

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      model: 'Tongyi-MAI/Z-Image-Turbo',
      prompt: `头雕定制设计：${prompt}。风格：写实雕塑，精细工艺，收藏级品质，3D渲染，工作室灯光。`,
      size,
      n: opts.n || 1,
      response_format: 'url',
    }),
  })

  const text = await response.text()

  if (!response.ok) {
    let errMsg = `AI 生成失败 (${response.status})`
    try {
      const err = JSON.parse(text)
      errMsg = err.error?.message || err.message || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  try {
    const data = JSON.parse(text)
    return (data.data || []).map(item => ({
      url: item.url,
      b64_json: item.b64_json || null,
    }))
  } catch {
    throw new Error('AI 服务返回数据格式异常，请稍后重试')
  }
}
