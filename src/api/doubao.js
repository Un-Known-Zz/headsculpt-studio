/**
 * 豆包 AI 文生图 —— 通过 Vercel Serverless 代理调用
 *
 * API 地址在 .env 的 VITE_API_WORKER_URL 配置
 * 格式示例：https://你的项目名.vercel.app/api/generate
 * API Key 完全隐藏在服务端环境变量中，前端无感知
 */

const API_URL = import.meta.env.VITE_API_WORKER_URL

export async function generateHeadSculpt(prompt, opts = {}) {
  if (!API_URL) {
    throw new Error('AI 服务未配置，请联系管理员')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: opts.model || 'doubao-seedream-5-0-260128',
      size: opts.size || '2K',
    }),
  })

  // 读取响应体（无论成功失败）
  const text = await response.text()

  if (!response.ok) {
    let errMsg = `AI 生成失败 (${response.status})`
    try {
      const err = JSON.parse(text)
      errMsg = err.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  try {
    const data = JSON.parse(text)
    return data.data || []
  } catch {
    throw new Error('AI 服务返回数据格式异常，请稍后重试')
  }
}
