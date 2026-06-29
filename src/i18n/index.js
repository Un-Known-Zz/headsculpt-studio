import { createI18n } from 'vue-i18n'
import messages from './messages.js'

const saved = localStorage.getItem('headsculpt_lang') || 'zh'

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale: 'zh',
  messages,
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
