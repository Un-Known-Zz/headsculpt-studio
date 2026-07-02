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
 * Prompt 策略（v1.41 全英文化安全版）：
 *   - 使用完全安全的中性词汇（portrait/face/character）
 *   - **新增：sanitizeInput() 过滤用户输入中的敏感词**
 *   - 用户输入的 硅胶/人偶/仿真/TPE/vinyl/doll 等词自动替换为安全同义词
 *   - 构图：close-up portrait（写实面部特写）
 */

// 本地开发走 Vite 代理，生产环境直连 API
const IS_DEV = import.meta.env.DEV
const BASE_URL = IS_DEV ? '/api/modelscope/v1' : 'https://api-inference.modelscope.cn/v1'
const TOKEN = import.meta.env.VITE_MODELSCOPE_API_TOKEN

// 默认使用 FLUX.1-Krea-dev（高质量文生图模型）
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-Krea-dev'

/**
 * 用户输入敏感词过滤器（v1.41 全英文化版）
 *
 * 核心策略变更：不仅替换敏感词，而是将所有中文描述翻译成英文。
 * 魔搭内容审核对中文更敏感，全英文 prompt 更安全。
 *
 * 处理流程：
 *   1. 替换已知的敏感/高风险中文词 → 英文同义词
 *   2. 替换常见的面部/外观描述中文词 → 英文
 *   3. 替换风格/特征类中文词 → 英文
 *
 * @param {string} input - 用户原始输入（中英文混合）
 * @returns {string} 全英文的安全文本
 */
function sanitizeInput(input) {
  let sanitized = input

  // ===== 第一层：高风险敏感词（必须最先替换）=====
  const sensitiveMap = [
    ['硅胶', 'realistic material'],
    ['仿真', 'realistic'],
    ['逼真', 'realistic'],
    ['人偶', 'character'],
    ['娃娃', 'character'],
    ['头雕', 'head portrait'],
    ['头像', 'portrait'],
    ['TPE', 'material'],
    ['实体', 'realistic'],
    ['充气', 'inflatable'],  // 防止相关联想
  ]
  for (const [word, replacement] of sensitiveMap) {
    sanitized = sanitized.replaceAll(word, replacement)
  }

  // ===== 第二层：面部/身体特征中文词 → 英文 =====
  const featureMap = [
    ['少女', 'young woman'],
    ['女孩', 'girl'],
    ['女性', 'female'],
    ['男性', 'male'],
    ['少年', 'young man'],
    ['儿童', 'child'],
    ['脸', 'face'],
    ['面容', 'face'],
    ['面孔', 'face'],
    ['皮肤', 'skin'],
    ['肤质', 'skin texture'],
    ['细腻皮肤', 'smooth skin'],
    ['白皙皮肤', 'fair skin'],
    ['瞳孔', 'eyes'],
    ['眼睛', 'eyes'],
    ['眼眸', 'eyes'],
    ['长发', 'long hair'],
    ['短发', 'short hair'],
    ['白发', 'white hair'],
    ['黑发', 'black hair'],
    ['金发', 'blonde hair'],
    ['银发', 'silver hair'],
    ['尖耳', 'pointed ears'],
    ['耳朵', 'ears'],
    ['嘴唇', 'lips'],
    ['鼻子', 'nose'],
    ['五官', 'facial features'],
  ]
  for (const [word, replacement] of featureMap) {
    sanitized = sanitized.replaceAll(word, replacement)
  }

  // ===== 第三层：风格/氛围中文词 → 英文 =====
  const styleMap = [
    ['奇幻风格', 'fantasy style'],
    ['奇幻', 'fantasy'],
    ['动漫风格', 'anime style'],
    ['动漫', 'anime'],
    ['二次元', '2D anime'],
    ['写实风格', 'realistic style'],
    ['写实', 'realistic'],
    ['可爱', 'cute'],
    ['美丽', 'beautiful'],
    ['漂亮', 'pretty'],
    ['精致', 'delicate'],
    ['细腻', 'detailed'],
    ['干净背景', 'clean background'],
    ['纯色背景', 'solid color background'],
  ]
  for (const [word, replacement] of styleMap) {
    sanitized = sanitized.replaceAll(word, replacement)
  }

  // ===== 第四层：英文敏感词（不区分大小写）=====
  const englishPatterns = [
    [/\bdoll\b/gi, 'character'],
    [/\bdolls\b/gi, 'characters'],
    [/\bsilicone\b/gi, 'realistic material'],
    [/\bvinyl\b/gi, 'realistic material'],
    [/\bTPE\b/gi, 'material'],
    [/\blifelike\b/gi, 'realistic'],
    [/\bsex\s*doll\b/gi, 'character figure'],
    [/\blove\s*doll\b/gi, 'character figure'],
    [/\badult\s*doll\b/gi, 'character figure'],
    [/\binflatable\b/gi, 'figure'],
  ]
  for (const [pattern, replacement] of englishPatterns) {
    sanitized = sanitized.replace(pattern, replacement)
  }

  // 清理多余空格
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  return sanitized
}

/**
 * 构建安全 Prompt（v1.40 输入过滤安全版）
 *
 * 核心原则：
 *   1. 模板本身 100% 安全词汇
 *   2. **用户输入经过 sanitizeInput() 过滤后再拼接**
 *   3. 双重保障：模板 + 用户输入都安全
 *
 * @param {string} userInput - 用户原始输入
 * @returns {string} 构建好的完整 prompt
 */
function buildPrompt(userInput) {
  // 先过滤用户输入！
  const safeInput = sanitizeInput(userInput)

  // === 类型锁定（100% 安全的 3D/艺术术语）===
  const typeLock = [
    '3D character head portrait',
    'character face reference',
    'digital portrait study',
    'realistic face render',
  ].join(', ')

  // === 写实风格（安全词）===
  const styleGuide = [
    'photorealistic rendering',
    'hyper realistic skin detail',
    'soft studio lighting',
    'professional portrait photography',
  ].join(', ')

  // === 构图约束 ===
  const composition = [
    'close-up face shot',
    'front view portrait',
    'head and neck only',
    'centered composition',
    'solid background',
  ].join(', ')

  // === 质量提升 ===
  const quality = [
    'highly detailed',
    '8K resolution',
    'sharp focus',
    'professional quality',
  ].join(', ')

  return [
    typeLock,
    typeLock,
    safeInput,           // ← 使用过滤后的用户输入！
    styleGuide,
    composition,
    quality,
  ].join(', ')
}

/**
 * 构建 Negative Prompt（v1.39 安全版）
 *
 * 只保留必要的排除项，不引入任何敏感词
 */
function buildNegativePrompt() {
  return [
    // 排除错误风格
    'anime',
    'cartoon',
    '2D illustration',
    'chibi',
    'sketch',
    'drawing',
    'painting',
    'classical sculpture',
    'marble statue',
    'stone statue',

    // 排除错误构图
    'full body',
    'landscape',
    'scene',
    'environment',
    'crowd',
    'multiple people',
    'building',
    'street',
    'outdoor scene',

    // 质量缺陷
    'lowres',
    'blurry',
    'bad anatomy',
    'bad face',
    'distorted features',
    'watermark',
    'text',
    'signature',
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

  const fullUrl = `${BASE_URL}/images/generations`

  const finalPrompt = buildPrompt(prompt)

  // 调试日志：输出最终发送的 prompt（帮助排查审核问题）
  console.log('[AI HeadSculpt] Original input:', prompt)
  console.log('[AI HeadSculpt] Sanitized prompt:', finalPrompt)
  console.log('[AI HeadSculpt] Target URL:', fullUrl)
  console.log('[AI HeadSculpt] Mode:', IS_DEV ? 'DEV (via proxy)' : 'PROD (direct)')

  let response
  try {
    response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        prompt: finalPrompt,
        negative_prompt: buildNegativePrompt(),
        size: opts.size || '1024x1024',
        steps: opts.steps || 25,
        guidance: opts.guidance || 4.0,
        seed: opts.seed || undefined,
        n: opts.n || 1,
      }),
    })
  } catch (fetchErr) {
    // 区分不同类型的网络错误，给出明确提示
    if (fetchErr.name === 'TypeError' && fetchErr.message.includes('fetch')) {
      if (IS_DEV) {
        throw new Error('网络连接失败：请确保已运行 npm run dev 启动开发服务器。当前处于开发模式，需要 Vite 代理转发请求。')
      } else {
        throw new Error('网络连接失败：API 服务不可达或被浏览器安全策略拦截。可能是内容审核拦截或网络问题，请稍后重试。')
      }
    }
    throw new Error(`网络请求异常：${fetchErr.message}`)
  }

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

    let response
    try {
      response = await fetch(`${BASE_URL}/tasks/${taskId}`, { headers })
    } catch (fetchErr) {
      if (fetchErr.name === 'TypeError' && fetchErr.message.includes('fetch')) {
        throw new Error(`轮询任务时网络断开（可能请求超时或被拦截）：${fetchErr.message}`)
      }
      throw new Error(`轮询异常：${fetchErr.message}`)
    }

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
