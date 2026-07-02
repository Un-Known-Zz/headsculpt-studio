<template>
  <Teleport to="body">
    <div class="ai-modal-backdrop" :class="{ open: visible }" @click.self="close">
      <div class="ai-modal">

        <!-- 顶部栏 -->
        <div class="ai-modal-header">
          <div class="ai-modal-title">
            <span class="ai-icon">✦</span>
            <h3>AI 头雕设计助手</h3>
          </div>
          <button class="ai-modal-close" @click="close">&times;</button>
        </div>

        <!-- 主内容区 -->
        <div class="ai-main-body" ref="chatBody">

          <!-- 欢迎状态 / 对话历史 -->
          <div v-if="messages.length === 0 && !hasHistory" class="ai-welcome">
            <div class="ai-welcome-icon">🎨</div>
            <h4>描述您想要的头雕</h4>
            <p>用文字描述您理想中的头雕作品，AI 将为您生成设计参考图</p>
            <div class="ai-examples">
              <button v-for="ex in examples" :key="ex" class="ai-example-btn" @click="useExample(ex)">
                {{ ex }}
              </button>
            </div>
          </div>

          <!-- 历史消息列表 -->
          <template v-for="(msg, i) in messages" :key="i">
            <!-- 用户消息：浅蓝色气泡 -->
            <div v-if="msg.role === 'user'" class="ai-msg-row ai-msg-user">
              <div class="ai-user-bubble">{{ msg.content }}</div>
            </div>

            <!-- AI 回复 -->
            <div v-if="msg.role === 'assistant'" class="ai-msg-row ai-msg-assistant">
              <div class="ai-response-wrap">
                <!-- AI 文字回复 -->
                <div v-if="msg.content" class="ai-reply-text">{{ msg.content }}</div>
                <!-- 生成的图片网格（横向排列） -->
                <div v-if="msg.images?.length" :class="['ai-images-row', `cols-${msg.images.length}`]">
                  <div v-for="(img, idx) in msg.images" :key="idx" class="ai-img-item">
                    <img :src="img.url || img.b64_data" :alt="`生成图${idx+1}`" @load="scrollToBottom" />
                    <div class="ai-img-overlay">
                      <a v-if="img.url" :href="img.url" target="_blank" download class="ai-img-dl-btn" title="下载">⬇</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 加载动画 -->
          <div v-if="loading" class="ai-msg-row ai-msg-assistant">
            <div class="ai-loading">
              <span></span><span></span><span></span>
              <span class="ai-loading-text">AI 正在创作中...</span>
            </div>
          </div>
        </div>

        <!-- 输入区域（全新设计） -->
        <div class="ai-input-area">
          <!-- 上传区 + 文本框 -->
          <div class="ai-input-box">
            <!-- 左侧图片上传 -->
            <div class="ai-upload-zone" :class="{ 'has-image': uploadedImages.length > 0 }"
                 @click="triggerUpload"
                 @dragover.prevent @drop.prevent="handleDrop"
                 @paste="handlePaste">
              <template v-if="uploadedImages.length === 0">
                <div class="ai-upload-icon">+</div>
                <div class="ai-upload-text">上传</div>
              </template>
              <template v-else>
                <div class="ai-upload-preview">
                  <img :src="uploadedImages[0].preview" alt="参考图" />
                  <button class="ai-upload-remove" @click.stop="removeImage(0)" title="删除">&times;</button>
                </div>
              </template>
              <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect" />
            </div>

            <!-- 文本输入 -->
            <textarea
              v-model="inputText"
              class="ai-textarea"
              :placeholder="t('ai.placeholder') || '描述画面，可 Ctrl+V 粘贴图片或拖拽上传'"
              rows="2"
              ref="inputRef"
            ></textarea>

            <!-- 右侧设置图标 -->
            <button class="ai-settings-btn" title="高级设置">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>

            <!-- 生成按钮 -->
            <button class="ai-generate-btn" :disabled="!canGenerate" @click="generate">
              <span v-if="!loading">立即生成</span>
              <span v-else class="ai-generate-loading">
                <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
              </span>
            </button>
          </div>

          <!-- 底部工具栏 -->
          <div class="ai-toolbar">
            <!-- 左侧：模式 + 风格标签 -->
            <div class="ai-toolbar-left">
              <button class="ai-mode-chip active">图片</button>
              <button v-for="style in styleChips" :key="style" class="ai-style-chip">{{ style }}</button>
            </div>

            <!-- 中间：比例提示 -->
            <span class="ai-ratio-hint">智能 比例</span>

            <!-- 右侧：张数选择器 -->
            <div class="ai-count-selector" ref="countDropdown">
              <button class="ai-count-btn" @click="toggleCountDropdown">
                {{ imageCount }}张<span class="ai-count-label">张数</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
              <div v-if="showCountDropdown" class="ai-count-dropdown">
                <button v-for="n in [1, 4]" :key="n" class="ai-count-option"
                        :class="{ active: imageCount === n }" @click="selectCount(n)">
                  {{ n }}张
                </button>
              </div>
            </div>
          </div>

          <!-- 提示文字 -->
          <p class="ai-input-hint">{{ t('ai.hint') || 'AI 生成仅供参考，实际作品以手工制作为准' }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateHeadSculpt } from '@/api/doubao.js'

const { t } = useI18n()

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

// ===== 状态 =====
const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const chatBody = ref(null)
const inputRef = ref(null)
const fileInput = ref(null)
const countDropdown = ref(null)

// 图片上传
const uploadedImages = ref([])

// 张数选择
const imageCount = ref(1)
const showCountDropdown = ref(false)

// 风格标签（示例）
const styleChips = ['写实', '动漫']

// 示例提示词
const examples = [
  '写实风格女性面部，黑长直发，自然表情',
  '金发蓝眼，精致五官，柔和眼神',
  '银灰色双丸子头，可爱风格',
  '精灵尖耳白发，奇幻风格面部',
]

const hasHistory = computed(() => messages.value.length > 0)
const canGenerate = computed(() => {
  return (inputText.value.trim().length > 0 || uploadedImages.value.length > 0) && !loading.value
})

// ===== 图片上传功能 =====
function triggerUpload() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) addImageFile(file)
  // reset so same file can be re-selected
  e.target.value = ''
}

function handleDrop(e) {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) addImageFile(file)
}

async function handlePaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) addImageFile(file)
      break
    }
  }
}

function addImageFile(file) {
  // 只保留一张参考图
  const reader = new FileReader()
  reader.onload = () => {
    uploadedImages.value = [{
      file,
      preview: reader.result,
      b64_data: reader.result,
    }]
  }
  reader.readAsDataURL(file)
}

function removeImage(idx) {
  uploadedImages.value.splice(idx, 1)
}

// ===== 张数选择 =====
function toggleCountDropdown() {
  showCountDropdown.value = !showCountDropdown.value
}

function selectCount(n) {
  imageCount.value = n
  showCountDropdown.value = false
}

// 点击外部关闭下拉
function handleClickOutside(e) {
  if (showCountDropdown.value && countDropdown.value && !countDropdown.value.contains(e.target)) {
    showCountDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// ===== 示例点击 =====
function useExample(ex) {
  inputText.value = ex
}

// ===== 发送 / 生成 =====
async function generate() {
  const text = inputText.value.trim()
  if ((!text && uploadedImages.value.length === 0) || loading.value) return

  // 构建用户消息文本
  let userContent = text
  if (uploadedImages.value.length > 0) {
    userContent = text ? `${text}（附参考图）` : '（上传了一张参考图）'
  }

  messages.value.push({ role: 'user', content: userContent })
  inputText.value = ''

  // 保存当前上传的图片信息用于本次请求
  const currentImages = [...uploadedImages.value]

  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const images = await generateHeadSculpt(text, {
      n: imageCount.value,
      referenceImages: currentImages.map(img => img.b64_data),
    })

    // AI 回复文案
    const replyText = buildReplyText(text)

    messages.value.push({
      role: 'assistant',
      content: replyText,
      images: images || [],
    })
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: `生成失败：${e.message}`,
      images: [],
    })
  } finally {
    loading.value = false
    uploadedImages.value = [] // 清空已上传的参考图
    await nextTick()
    scrollToBottom()
  }
}

/**
 * 根据用户输入构建友好的 AI 回复文案
 */
function buildReplyText(input) {
  if (!input) return '没问题！这就为您生成一张设计参考图。'

  // 截取前30字作为摘要
  const summary = input.length > 30 ? input.slice(0, 30) + '...' : input
  return `没问题，这就为您绘制${summary}，质感绝对细腻逼真！`
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* ========== 弹窗背景 ========== */
.ai-modal-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s ease;
}
.ai-modal-backdrop.open {
  opacity: 1; pointer-events: auto;
}

/* ========== 弹窗主体 ========== */
.ai-modal {
  width: 720px; max-width: 94vw; max-height: 88vh;
  background: #ffffff;
  border-radius: 20px;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06);
  overflow: hidden;
}
@media (max-width: 600px) {
  .ai-modal {
    width: 96vw; max-height: 92vh; border-radius: 16px;
  }
}

/* ========== 顶部栏 ========== */
.ai-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid #f0eff3;
  flex-shrink: 0;
}
.ai-modal-title {
  display: flex; align-items: center; gap: 10px;
}
.ai-modal-title h3 {
  font-size: 16px; font-weight: 650; margin: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.ai-icon { font-size: 18px; }
.ai-modal-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: #f5f4f7; border: none;
  color: #999; font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.ai-modal-close:hover { background: #7c3aed; color: #fff; }

/* ========== 主内容区 ========== */
.ai-main-body {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  min-height: 120px; max-height: 45vh;
  display: flex; flex-direction: column; gap: 16px;
}

/* ----- 欢迎页 ----- */
.ai-welcome {
  text-align: center; padding: 28px 0 12px;
}
.ai-welcome-icon { font-size: 44px; margin-bottom: 12px; }
.ai-welcome h4 { font-size: 17px; margin-bottom: 8px; color: #1a1a2e; font-weight: 600; }
.ai-welcome p { font-size: 13px; color: #888; margin-bottom: 18px; line-height: 1.55; }

.ai-examples {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.ai-example-btn {
  padding: 7px 16px; border-radius: 20px; font-size: 12.5px;
  background: #f8f7fc; border: 1px solid #edeaf3;
  color: #555; cursor: pointer;
  transition: all 0.2s ease; line-height: 1.4;
}
.ai-example-btn:hover {
  border-color: #a78bfa; color: #7c3aed; background: #f3eeff;
}

/* ========== 消息行 ========== */
.ai-msg-row {
  width: 100%;
}

/* 用户气泡（截图2样式：浅蓝圆角） */
.ai-msg-user {
  display: flex; justify-content: flex-start;
}
.ai-user-bubble {
  display: inline-block;
  max-width: 90%; padding: 14px 20px;
  background: linear-gradient(135deg, #eef4ff, #e8f0fe);
  border: 1px solid #dce6fd;
  border-radius: 14px;
  font-size: 14px; line-height: 1.65;
  color: #333; word-break: break-word;
}

/* AI 回复区 */
.ai-msg-assistant {
  display: flex; justify-content: flex-start;
}
.ai-response-wrap {
  width: 100%; max-width: 100%;
}

/* AI 回复文字 */
.ai-reply-text {
  margin-bottom: 12px;
  font-size: 14px; line-height: 1.6;
  color: #333;
}

/* ========== 图片网格（横向排列，截图2样式）========== */
.ai-images-row {
  display: flex; gap: 10px; flex-wrap: nowrap;
  width: 100%; overflow-x: auto; padding-bottom: 4px;
}
.ai-images-row.cols-1 { justify-content: flex-start; }
.ai-images-row.cols-2 { }
.ai-images-row.cols-3 { }
.ai-images-row.cols-4 { }

.ai-img-item {
  position: relative; flex-shrink: 0;
  border-radius: 12px; overflow: hidden;
  aspect-ratio: 1;
  background: #f7f6fa;
  border: 1px solid #edeaf3;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}
/* 根据数量动态调整宽度 */
.ai-images-row.cols-1 .ai-img-item { width: 260px; }
.ai-images-row.cols-2 .ai-img-item { width: calc(50% - 5px); }
.ai-images-row.cols-3 .ai-img-item { width: calc(33.33% - 7px); }
.ai-images-row.cols-4 .ai-img-item { width: calc(25% - 8px); }

@media (max-width: 500px) {
  .ai-images-row.cols-2 .ai-img-item,
  .ai-images-row.cols-3 .ai-img-item,
  .ai-images-row.cols-4 .ai-img-item { width: calc(50% - 5px); }
}

.ai-img-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.15);
}
.ai-img-item img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
}
.ai-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(transparent 60%, rgba(0,0,0,0.35));
  opacity: 0; transition: opacity 0.2s;
  display: flex; align-items: flex-end; justify-content: flex-end; padding: 8px;
}
.ai-img-item:hover .ai-img-overlay { opacity: 1; }
.ai-img-dl-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.95); color: #333;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; font-size: 14px;
  transition: transform 0.2s;
}
.ai-img-dl-btn:hover { transform: scale(1.1); }

/* ========== 加载动画 ========== */
.ai-loading {
  display: flex; align-items: center; gap: 6px; padding: 14px 20px;
  background: #f8f7fc; border: 1px solid #edeaf3;
  border-radius: 14px;
}
.ai-loading span:not(.ai-loading-text) {
  width: 8px; height: 8px; border-radius: 50%;
  background: #a78bfa;
  animation: aiBounce 1.2s infinite;
}
.ai-loading span:nth-child(2) { animation-delay: 0.15s; }
.ai-loading span:nth-child(3) { animation-delay: 0.3s; }
.ai-loading-text { color: #888; font-size: 13px; }
@keyframes aiBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
  40% { transform: 1); opacity: 1; }
}

/* ========== 输入区域（截图1样式）========== */
.ai-input-area {
  padding: 14px 20px 16px;
  border-top: 1px solid #f0eff3;
  flex-shrink: 0;
  background: #fafafa;
}

/* 输入框容器：上传 | 文本 | 设置 | 按钮 */
.ai-input-box {
  display: flex; gap: 10px; align-items: stretch;
  background: #fff; border: 2px solid #e8e6ef;
  border-radius: 14px; padding: 8px 10px;
  transition: border-color 0.2s;
}
.ai-input-box:focus-within {
  border-color: #a78bfa;
}

/* --- 左侧上传区域 --- */
.ai-upload-zone {
  width: 64px; min-height: 64px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f8f7fc; border: 2px dashed #dcd9e6;
  border-radius: 10px; cursor: pointer;
  transition: all 0.2s; flex-shrink: 0;
  overflow: hidden;
}
.ai-upload-zone:hover {
  border-color: #a78bfa; background: #f3eeff;
}
.ai-upload-zone.has-image {
  border-style: solid; border-color: #c4b8e6;
}
.ai-upload-icon {
  font-size: 22px; color: #aaa; font-weight: 300; line-height: 1;
}
.ai-upload-text {
  font-size: 11px; color: #bbb; margin-top: 2px;
}
.ai-upload-preview {
  width: 100%; height: 100%; position: relative;
}
.ai-upload-preview img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
}
.ai-upload-remove {
  position: absolute; top: 2px; right: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0,0,0,0.55); color: #fff;
  border: none; font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.ai-upload-preview:hover .ai-upload-remove { opacity: 1; }

/* --- 文本输入框 --- */
.ai-textarea {
  flex: 1; padding: 8px 4px;
  background: transparent; border: none; outline: none;
  color: #333; font-size: 14px;
  resize: none; font-family: inherit;
  min-height: 48px; max-height: 96px;
  line-height: 1.5;
}
.ai-textarea::placeholder { color: #bbb; }

/* --- 设置按钮 --- */
.ai-settings-btn {
  width: 40px; flex-shrink: 0;
  background: none; border: none;
  color: #aaa; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
}
.ai-settings-btn:hover { color: #7c3aed; background: #f3eeff; }

/* --- 立即生成按钮 --- */
.ai-generate-btn {
  height: auto; padding: 10px 22px; flex-shrink: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none; border-radius: 10px;
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center;
}
.ai-generate-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124,58,237,0.35);
}
.ai-generate-btn:disabled {
  opacity: 0.4; cursor: not-allowed;
  transform: none; box-shadow: none;
}

.ai-generate-loading {
  display: flex; gap: 4px;
}
.ai-generate-loading .ai-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #fff;
  animation: genPulse 1s infinite;
}
.ai-generate-loading .ai-dot:nth-child(2) { animation-delay: 0.2s; }
.ai-generate-loading .ai-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes genPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* ========== 底部工具栏 ========== */
.ai-toolbar {
  display: flex; align-items: center; gap: 10px;
  margin-top: 10px;
}
.ai-toolbar-left {
  display: flex; align-items: center; gap: 6px;
}

/* 模式 chip（紫色激活态） */
.ai-mode-chip {
  padding: 5px 14px; border-radius: 18px; font-size: 12.5px;
  background: #7c3aed; color: #fff; border: none;
  cursor: default; font-weight: 550;
}
/* 风格 chip */
.ai-style-chip {
  padding: 5px 14px; border-radius: 18px; font-size: 12.5px;
  background: #f0ecef; color: #666; border: 1px solid #e8e4eb;
  cursor: pointer; transition: all 0.2s;
}
.ai-style-chip:hover {
  border-color: #c4b8e6; color: #7c3aed;
}

/* 智能比例 */
.ai-ratio-hint {
  font-size: 11.5px; color: #aaa; margin-left: 4px;
}

/* 张数选择器 */
.ai-count-selector {
  position: relative; margin-left: auto;
}
.ai-count-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 18px; font-size: 12.5px;
  background: #fff; border: 1px solid #ddd; color: #555;
  cursor: pointer; transition: all 0.2s;
}
.ai-count-btn:hover { border-color: #a78bfa; color: #7c3aed; }
.ai-count-label { color: #aaa; font-size: 11.5px; }
.ai-count-btn svg { flex-shrink: 0; }

/* 下拉面板 */
.ai-count-dropdown {
  position: absolute; bottom: 100%; right: 0; margin-bottom: 6px;
  background: #fff; border: 1px solid #e8e4eb; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  overflow: hidden; z-index: 10; min-width: 90px;
}
.ai-count-option {
  display: block; width: 100%;
  padding: 9px 18px; text-align: left;
  background: none; border: none;
  font-size: 13px; color: #444; cursor: pointer;
  transition: background 0.15s;
}
.ai-count-option:hover { background: #f5f3fa; }
.ai-count-option.active {
  background: #f3eeff; color: #7c3aed; font-weight: 600;
}

/* 提示文字 */
.ai-input-hint {
  margin: 7px 0 0; font-size: 11px; color: #ccc; text-align: left;
}

/* ========== 滚动条美化 ========== */
.ai-main-body::-webkit-scrollbar { width: 5px; }
.ai-main-body::-webkit-scrollbar-track { background: transparent; }
.ai-main-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
.ai-main-body::-webkit-scrollbar-thumb:hover { background: #ccc; }

.ai-images-row::-webkit-scrollbar { height: 4px; }
.ai-images-row::-webkit-scrollbar-track { background: transparent; }
.ai-images-row::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
</style>
