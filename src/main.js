import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

import './styles/tokens.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/components.css'
import './styles/responsive.css'

const app = createApp(App)
app.use(router)
app.use(i18n)

// 全局错误处理 - 防止组件静默失败导致白屏
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
  // 在页面上显示错误信息（仅开发/调试用）
  const el = document.getElementById('__vue_error__')
  if (el) { el.textContent = `[Vue Error] ${err.message || err}`; el.style.display = 'block' }
}

app.config.globalProperties.$throw = (err) => { throw err }

app.mount('#app')

// 注入错误显示容器（如果有 Vue 错误会在这里显示）
if (!document.getElementById('__vue_error__')) {
  const div = document.createElement('div')
  div.id = '__vue_error__'
  div.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;background:#e74c3c;color:white;padding:12px;text-align:center;z-index:99999;font:14px/1.4 system-ui,sans-serif;word-break:break-all;'
  document.body.appendChild(div)
}
