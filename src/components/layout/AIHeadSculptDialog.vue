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

        <!-- 对话区域 -->
        <div class="ai-chat-body" ref="chatBody">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="ai-welcome">
            <div class="ai-welcome-icon">🎨</div>
            <h4>描述您想要的头雕</h4>
            <p>用文字描述您理想中的头雕作品，AI 将为您生成设计参考图</p>
            <div class="ai-examples">
              <button v-for="ex in examples" :key="ex" class="ai-example-btn" @click="sendExample(ex)">
                {{ ex }}
              </button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-for="(msg, i) in messages" :key="i" :class="['ai-message', msg.role]">

            <!-- 用户消息 -->
            <template v-if="msg.role === 'user'">
              <div class="ai-message-bubble user-bubble">{{ msg.content }}</div>
            </template>

            <!-- AI 回复 -->
            <template v-if="msg.role === 'assistant'">
              <!-- 生成图片 -->
              <div v-if="msg.images?.length" class="ai-images-grid">
                <div v-for="(img, idx) in msg.images" :key="idx" class="ai-image-card">
                  <img :src="img.url" :alt="msg.content || 'AI生成头雕'" @load="scrollToBottom" />
                  <a :href="img.url" target="_blank" class="ai-image-download" title="下载图片">⬇</a>
                </div>
              </div>
              <!-- 文字回复 -->
              <div v-if="msg.content" class="ai-message-bubble ai-bubble">{{ msg.content }}</div>
            </template>
          </div>

          <!-- 加载动画 -->
          <div v-if="loading" class="ai-message ai-msg-assistant">
            <div class="ai-loading">
              <span></span><span></span><span></span>
              <span style="margin-left:8px;color:var(--text-secondary);font-size:13px">AI 正在创作中...</span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="ai-chat-input">
          <div class="ai-input-wrap">
            <textarea
              v-model="inputText"
              :placeholder="t('ai.placeholder') || '描述您想要的头雕样式...'"
              @keydown.enter.exact.prevent="send"
              rows="1"
              ref="inputRef"
            />
            <button class="ai-send-btn" :disabled="!inputText.trim() || loading" @click="send">
              <span v-if="!loading">▶</span>
              <span v-else class="ai-spinner">◌</span>
            </button>
          </div>
          <p class="ai-input-hint">{{ t('ai.hint') || 'Enter 发送 · AI 生成仅供参考，实际作品以手工制作为准' }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateHeadSculpt } from '@/api/doubao.js'

const { t } = useI18n()

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const chatBody = ref(null)
const inputRef = ref(null)

const examples = [
  '写实风格女性头雕，黑长直发',
  '动漫角色金发蓝眼，精细涂装',
  '银灰色双丸子头游戏角色',
  '精灵角色尖耳白发，奇幻风格',
]

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const images = await generateHeadSculpt(text)
    messages.value.push({
      role: 'assistant',
      content: `"${text}" 的设计参考图：`,
      images,
    })
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: `生成失败：${e.message}`,
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function sendExample(ex) {
  inputText.value = ex
  send()
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
.ai-modal-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s;
}
.ai-modal-backdrop.open {
  opacity: 1; pointer-events: auto;
}

.ai-modal {
  width: 520px; max-width: 94vw; max-height: 86vh;
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: 20px;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  overflow: hidden;
}

.ai-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px;
  border-bottom: var(--border-thin);
  flex-shrink: 0;
}
.ai-modal-title {
  display: flex; align-items: center; gap: 10px;
}
.ai-modal-title h3 {
  font-size: 16px; font-weight: 600; margin: 0;
  background: linear-gradient(135deg, var(--accent-gold), #f0d060);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.ai-icon { font-size: 20px; }
.ai-modal-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--bg-surface); border: var(--border-thin);
  color: var(--text-secondary); font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.ai-modal-close:hover { background: var(--accent-gold); color: #000; }

/* 对话区域 */
.ai-chat-body {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  min-height: 200px; max-height: 450px;
  display: flex; flex-direction: column; gap: 12px;
}

.ai-welcome {
  text-align: center; padding: 24px 0 16px;
}
.ai-welcome-icon { font-size: 48px; margin-bottom: 12px; }
.ai-welcome h4 { font-size: 16px; margin-bottom: 8px; color: var(--text-primary); }
.ai-welcome p { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5; }

.ai-examples {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.ai-example-btn {
  padding: 7px 14px; border-radius: 20px; font-size: 12px;
  background: var(--bg-surface); border: var(--border-thin);
  color: var(--text-secondary); cursor: pointer;
  transition: all 0.2s; line-height: 1.4;
}
.ai-example-btn:hover {
  border-color: var(--accent-gold); color: var(--accent-gold);
}

/* 消息行 */
.ai-message {
  display: flex;
  width: 100%;
}
.ai-message.user {
  justify-content: flex-end;
}
.ai-msg-assistant {
  justify-content: flex-start;
}

/* 气泡统一样式 */
.ai-message-bubble {
  max-width: 85%; padding: 10px 16px; border-radius: 16px; font-size: 14px;
  line-height: 1.55; word-break: break-word; white-space: pre-wrap;
}

/* 用户气泡（右） */
.user-bubble {
  background: var(--accent-gold); color: #000;
  border-bottom-right-radius: 4px;
}

/* AI 气泡（左） */
.ai-bubble {
  background: var(--bg-surface); color: var(--text-primary);
  border: var(--border-thin); border-bottom-left-radius: 4px;
}

/* 生成图片网格 */
.ai-images-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  max-width: 400px; width: 100%;
  margin-top: 4px;
}
.ai-image-card {
  position: relative; border-radius: 14px; overflow: hidden;
  aspect-ratio: 1; background: var(--bg-surface);
  border: var(--border-thin);
}
.ai-image-card img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.3s;
}
.ai-image-card:hover img { transform: scale(1.04); }
.ai-image-download {
  position: absolute; bottom: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.7); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; text-decoration: none;
  opacity: 0; transition: opacity 0.2s;
}
.ai-image-card:hover .ai-image-download { opacity: 1; }

/* 加载动画 */
.ai-loading {
  display: flex; align-items: center; gap: 5px; padding: 12px 16px;
  background: var(--bg-surface); border: var(--border-thin);
  border-radius: 16px; border-bottom-left-radius: 4px;
}
.ai-loading span:not(:last-child) {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent-gold);
  animation: aiBounce 1.2s infinite;
}
.ai-loading span:nth-child(2) { animation-delay: 0.2s; }
.ai-loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes aiBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区域 */
.ai-chat-input {
  padding: 14px 20px;
  border-top: var(--border-thin);
  flex-shrink: 0;
}
.ai-input-wrap {
  display: flex; gap: 8px; align-items: flex-end;
}
.ai-input-wrap textarea {
  flex: 1; padding: 10px 16px; border-radius: 12px;
  background: var(--bg-surface); border: var(--border-thin);
  color: var(--text-primary); font-size: 14px;
  resize: none; outline: none;
  font-family: inherit;
  min-height: 42px; max-height: 100px;
  transition: border-color 0.2s; line-height: 1.45;
}
.ai-input-wrap textarea:focus {
  border-color: var(--accent-gold);
}
.ai-send-btn {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: var(--accent-gold); border: none;
  color: #000; font-size: 15px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ai-send-btn:not(:disabled):hover { transform: scale(1.06); }

.ai-spinner {
  display: inline-block; animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.ai-input-hint {
  margin: 6px 0 0; font-size: 11px; color: var(--text-muted);
}
</style>
