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
 *
 * Prompt 策略（v1.36 优化版）：
 *   - 使用精准的现代手办/树脂雕像术语（garage kit, resin figurine, PVC figure）
 *   - 强力排除古典雕塑/石膏像/雕像等干扰风格
 *   - 关键特征词前置+重复增强权重
 *   - 用户输入保留原样（中英文均可），由模板引导模型理解
 */

// 本地开发走 Vite 代理，生产环境直连 API
const IS_DEV = import.meta.env.DEV
const BASE_URL = IS_DEV ? '/api/modelscope/v1' : 'https://api-inference.modelscope.cn/v1'
const TOKEN = import.meta.env.VITE_MODELSCOPE_API_TOKEN

// 默认使用 FLUX.1-Krea-dev（高质量文生图模型）
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-Krea-dev'

/**
 * 构建高质量头雕 Prompt（v1.36 优化版）
 *
 * 设计原则：
 *   1. 类型词前置+重复 → 锁定"现代手办/树脂头雕"，避免生成古典雕塑
 *   2. 用户输入紧随其后 → 模型优先关注用户描述的核心特征
 *   3. 风格/材质/构图/质量词分层排列 → 结构化引导输出
 *   4. 不翻译用户输入 → 保留原始表达，FLUX 对中英混合可基本理解
 *
 * @param {string} userInput - 用户原始输入（中英文均可）
 * @returns {string} 构建好的完整 prompt
 */
function buildPrompt(userInput) {
  // === 第一层：类型锁定（重复2次增强权重，防止模型跑偏成古典雕塑）===
  const typeLock = [
    'garage kit bust',      // GK 手办半身像
    'resin figurine',       // 树脂人偶
    'PVC figure bust',      // PVC 手办胸像
    'collectible head sculpture', // 可收藏头雕
  ].join(', ')

  // === 第二层：风格引导（明确是"现代手办风"不是"古典雕像风"）===
  const styleGuide = [
    'anime figure style',   // 动漫手办风格
    'modern resin statue',  // 现代树脂雕像
    'detailed paintwork',   // 精细涂装
    'smooth matte surface', // 哑光质感
  ].join(', ')

  // === 第三层：材质与光影 ===
  const materialLighting = [
    'realistic skin texture or stylized figure finish',
    'studio lighting',
    'soft shadow',
    'solid neutral background',
    'product photography style',
  ].join(', ')

  // === 第四层：构图约束 ===
  const composition = [
    'front view',
    'head and shoulders only',
    'upper chest up',
    'centered composition',
  ].join(', ')

  // === 第五层：质量提升 ===
  const quality = [
    'highly detailed',
    '8K quality',
    'sharp focus',
    'professional craftsmanship',
  ].join(', ')

  // 组装：类型(2x权重) + 用户描述 + 风格 + 材质 + 构图 + 质量
  return [
    typeLock,
    typeLock, // 重复一次增强类型锁定
    `subject: ${userInput}`,
    styleGuide,
    materialLighting,
    composition,
    quality,
  ].join(', ')
}

/**
 * 构建 Negative Prompt（v1.36 强化版）
 *
 * 核心目标：
 *   - 排除古典/传统雕塑风格（这是生成不符的根本原因！）
 *   - 排除错误构图和场景
 *   - 排除质量缺陷
 */
function buildNegativePrompt() {
  return [
    // ===== 排除古典/传统雕塑（关键！）=====
    'classical sculpture',     // 古典雕塑
    'marble statue',          // 大理石像
    'stone carving',          // 石刻
    'stone statue',           // 石像
    'ancient greek',          // 古希腊风格
    'roman statue',           // 罗马雕像
    'michelangelo style',     // 米开朗基罗风格
    'renaissance sculpture',  // 文艺复兴雕塑
    'bronze statue',          // 铜像
    'museum artifact',        // 博物馆文物
    'archaeological',         // 考古风格
    'weathered stone',        // 风化石材
    'plaster cast',           // 石膏翻模

    // ===== 排除错误构图 =====
    'full body',
    'landscape',
    'scene',
    'environment',
    'background scenery',
    'crowd',
    'multiple people',
    'building',
    'street',
    'interior room',
    'outdoor',

    // ===== 排除质量缺陷 =====
    'lowres',
    'blurry',
    'bad anatomy',
    'bad hands',
    'bad face',
    'distorted features',
    'watermark',
    'text',
    'signature',
    'error',
    'low quality',
    'grainy',
    'pixelated',
  ].join(', ')
}

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
      prompt: buildPrompt(prompt),
      negative_prompt: buildNegativePrompt(),
      size: opts.size || '1024x1024',
      steps: opts.steps || 25,
      guidance: opts.guidance || 4.0,
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
  const { interval = 4000, timeout = 300000 } = options
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

  throw new Error('生成超时（5分钟），服务器繁忙，请稍后重试')
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
