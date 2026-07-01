/**
 * ============================================
 *  老李头头雕工作室 — Vercel Serverless API 代理
 * ============================================
 *
 * 部署方式：
 *   1. 在 vue-project 根目录创建 api/generate.js
 *   2. push 到 GitHub
 *   3. 在 Vercel 导入项目，自动识别 api/ 目录为 Serverless Functions
 *   4. Settings → Environment Variables 添加 DOUBAO_API_KEY
 *
 * 或者更简单：直接在 Vercel Dashboard 创建新项目，
 *   只需这一个文件就能跑起来
 */

export default async function handler(req, res) {
  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).headers(corsHeaders).send('')
  }

  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).headers(corsHeaders).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, model = 'doubao-seedream-5-0-260128', size = '2K' } = req.body

    if (!prompt || !prompt.trim()) {
      return res.status(400).headers(corsHeaders).json({ error: 'prompt 不能为空' })
    }

    // 从环境变量读取 API Key
    const apiKey = process.env.DOUBAO_API_KEY
    if (!apiKey) {
      return res.status(500).headers(corsHeaders).json({ error: '服务器配置错误，请联系管理员' })
    }

    // 转发请求到豆包 API
    const response = await fetch('https://ark.cn-beijing.volces.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: `头雕定制设计：${prompt}。风格：写实雕塑，精细工艺，收藏级品质。`,
        size,
        response_format: 'url',
        watermark: false,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).headers(corsHeaders).json({
        error: data.error?.message || `豆包 API 错误 (${response.status})`
      })
    }

    return res.status(200).headers(corsHeaders).json(data)

  } catch (err) {
    return res.status(500).headers(corsHeaders).json({ error: `服务器内部错误: ${err.message}` })
  }
}
