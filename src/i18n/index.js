import { createI18n } from 'vue-i18n'
import messages from './messages.js'

const saved = localStorage.getItem('headsculpt_lang') || 'zh'

/**
 * 自定义消息编译器 — 禁用 vue-i18n 的 linked message 格式（@:key）
 * 原因：邮件地址等普通文本中的 @ 符号会被误解析为 linked message，
 * 导致 "Invalid linked format" 错误使整个组件崩溃。
 * 本编译器支持 {var} 插值，但将 @ 视为普通字符。
 */
function safeMessageCompiler(message) {
  // 缓存已编译的函数，避免重复解析
  const compiled = (ctx) => {
    if (!message) return ''
    // 支持 {name} 插值语法
    return message.replace(/\{(\w+)\}/g, (match, name) => {
      if (ctx && ctx[name] !== undefined) return ctx[name]
      return match
    })
  }
  // 标记为已编译，防止 vue-i18n 再次编译
  compiled._compiler = { type: 'safe' }
  return compiled
}

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale: 'zh',
  messages,
  messageCompiler: safeMessageCompiler,
})

export function setLang(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('headsculpt_lang', lang)
  document.documentElement.lang = lang
}

export const supportedLangs = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VN' },
  { code: 'th', label: 'TH' },
]
