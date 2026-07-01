/**
 * ============================================
 *  老李头头雕工作室 — Cloudflare Worker 代理
 * ============================================
 *
 * 用途：隐藏豆包 AI API Key，前端不再暴露任何密钥
 * 部署步骤：
 *   1. 注册 Cloudflare（免费）：https://dash.cloudflare.com/sign-up
 *   2. 进入 Workers & Pages → Create Application → Create Worker
 *   3. 名字随意（如 headsculpt-api），点 Deploy
 *   4. 把下面这段代码完整粘贴进去，保存并部署
 *   5. Settings → Variables → 添加环境变量：
 *      - 名称：DOUBAO_API_KEY
 *      - 值：ark-c1c90824-a32b-4c11-93c0-dbbf698f024f-fc2c0
 *   6. 部署后你会得到一个地址，类似：
 *      https://headsculpt-api.你的用户名.workers.dev
 *   7. 把这个地址填到 vue-project 的 .env 里就行
 */

export default {
  async fetch(request, env) {
    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    try {
      // 解析前端传来的参数
      const body = await request.json()
      const { prompt, model = 'doubao-seedream-5-0-260128', size = '2K' } = body

      if (!prompt || !prompt.trim()) {
        return new Response(JSON.stringify({ error: 'prompt 不能为空' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      // 从 Worker 环境变量读取 API Key（前端完全看不到）
      const apiKey = env.DOUBAO_API_KEY
      if (!apiKey) {
        console.error('❌ 未设置 DOUBAO_API_KEY 环境变量')
        return new Response(JSON.stringify({ error: '服务器配置错误，请联系管理员' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      // 转发请求到豆包 API（Seedream 文生图）
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
        return new Response(JSON.stringify({
          error: data.error?.message || `豆包 API 错误 (${response.status})`
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      // 成功，返回给前端
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: `Worker 内部错误: ${err.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
  }
}
