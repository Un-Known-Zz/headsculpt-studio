/**
 * 豆包 AI 文生图 —— 通过 Cloudflare Worker 代理调用
 *
 * Worker 地址在 .env 的 VITE_API_WORKER_URL 配置
 * API Key 完全隐藏在 Worker 服务端，前端无感知
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
    // Worker 返回 { data: [...] } 格式
    return data.data || []
  } catch {
    throw new Error('AI 服务返回数据格式异常，请稍后重试')
  }
}
