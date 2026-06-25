import { computed, unref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Vue I18n v9 Composition API 的 tm() 替代
 * useI18n() 在 legacy: false 模式下不提供 tm()
 * t() 对数组值只会做复数化返回单个字符串
 * 此函数直接读取 messages 获取原始数组
 */
export function useTm(key) {
  const { messages, locale } = useI18n()
  return computed(() => {
    const parts = key.split('.')
    let val = messages.value[unref(locale)]
    for (const p of parts) {
      if (val == null) return []
      val = val[p]
    }
    return Array.isArray(val) ? val : val != null ? [val] : []
  })
}
