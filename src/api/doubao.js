/**
 * 魔搭 ModelScope 文生图 API 封装（异步任务模式）
 *
 * 认证：Header Authorization: Bearer {TOKEN}
 * 端点：
 *   - 提交任务: POST /v1/images/generations（需 X-ModelScope-Async-Mode: true）
 *   - 查询结果: GET /v1/tasks/{taskId}（需 X-ModelScope-Task-Type: image_generation）
 *
 * 开发环境：通过 Vite 代理 /api/modelscope 转发，绕过 CORS
 * 生产环境：直连 api-inference.modelscope.cn
 */

// 本地开发走 Vite 代理，生产环境直连 API
const IS_DEV = import.meta.env.DEV
const BASE_URL = IS_DEV ? '/api/modelscope/v1' : 'https://api-inference.modelscope.cn/v1'
const TOKEN = import.meta.env.VITE_MODELSCOPE_API_TOKEN

// 默认使用 FLUX.1-Krea-dev（高质量文生图模型）
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-Krea-dev'

/**
 * 提交图片生成任务（异步）
 * @returns {string} taskId
 */
async function submitTask(prompt, opts = {}) {
  const model = opts.model || DEFAULT_MODEL

  const headers = {
    'Content-Type': 'application/json',
    'X-ModelScope-Async-Mode': 'true',
  }

  // 生产环境下需要带 Token（本地开发由 Vite 代理注入）
  if (!IS_DEV && TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`
  }

  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      prompt: `Professional head sculpture bust, portrait figurine of: ${prompt}. Studio lighting, high detail 3D render, realistic sculpture texture, collectible quality figure photography, solid color background, front view of head and shoulders only.`,
      negative_prompt: 'scene, landscape, environment, background, full body, lowres, bad anatomy, bad hands, text, error, watermark, blurry, low quality, multiple people, crowd, building, street',
      size: opts.size || '1024x1024',
      steps: opts.steps || 30,
      guidance: opts.guidance || 3.5,
      seed: opts.seed || undefined,
      n: opts.n || 1,
    }),
  })

  const text = await response.text()

  if (!response.ok) {
    let errMsg = `提交任务失败 (${response.status})`
    try {
      const err = JSON.parse(text)
      errMsg = err.error?.message || err.errors?.message || err.message || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  // 异步模式返回 task_id
  try {
    const data = JSON.parse(text)

    if (data.task_id) {
      return data.task_id
    }

    // 如果直接返回了图片数据（同步模式），也兼容处理
    if (data.data && data.data.length > 0) {
      return { directResult: true, images: data.data }
    }

    throw new Error('未收到 task_id，响应格式异常')
  } catch (e) {
    if (e.message.includes('异常')) throw e
    throw new Error(`解析响应失败: ${text.slice(0, 200)}`)
  }
}

/**
 * 轮询任务状态直到完成
 * @param {string} taskId
 * @param {object} options - { interval: number(ms), timeout: number(ms) }
 */
async function pollTask(taskId, options = {}) {
  const { interval = 3000, timeout = 120000 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const headers = {}
    if (!IS_DEV && TOKEN) {
      headers['Authorization'] = `Bearer ${TOKEN}`
    }
    headers['X-ModelScope-Task-Type'] = 'image_generation'

    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, { headers })

    const text = await response.text()

    if (!response.ok) {
      let errMsg = `查询任务失败 (${response.status})`
      try {
        const err = JSON.parse(text)
        errMsg = err.error?.message || err.message || errMsg
      } catch {}
      throw new Error(errMsg)
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('任务状态响应格式异常')
    }

    const status = data.task_status

    switch (status) {
      case 'SUCCEED':
        // 成功，返回图片 URL 列表
        const images = data.output_images || []
        if (images.length === 0) {
          throw new Error('任务成功但没有返回图片')
        }
        return images.map(url => ({ url }))

      case 'FAILED':
        throw new Error(data.message || '生成任务执行失败')

      case 'PENDING':
      case 'RUNNING':
      default:
        // 还在运行中，等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, interval))
        continue
    }
  }

  throw new Error('生成超时（120秒），请稍后重试')
}

/**
 * 主函数：生成头雕设计图
 * @returns {Array<{url: string}>} 图片列表
 */
export async function generateHeadSculpt(prompt, opts = {}) {
  if (!TOKEN && !IS_DEV) {
    throw new Error('AI 服务未配置，请联系管理员')
  }

  // Step 1: 提交任务
  const result = await submitTask(prompt, opts)

  // 如果是同步直返结果，直接返回
  if (result && result.directResult) {
    return result.images
  }

  // Step 2: 轮询等待结果
  const taskId = result
  return pollTask(taskId, opts.pollOptions)
}
