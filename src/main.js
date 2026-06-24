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
app.mount('#app')
