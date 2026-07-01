<template>
  <header class="navbar" :class="{ scrolled, 'nav-hidden': hidden }">
    <div class="navbar-inner">
      <router-link to="/" class="nav-logo" exact-active-class="">
        <span class="nav-logo-icon">L</span>
        <span class="nav-logo-text">老李头<span>头雕</span></span>
      </router-link>
      <nav class="nav-links">
        <router-link to="/" class="nav-link" exact-active-class="active">{{ t('nav.home') }}</router-link>
        <router-link to="/about" class="nav-link" active-class="active">{{ t('nav.about') }}</router-link>
        <router-link to="/products" class="nav-link" active-class="active">{{ t('nav.products') }}</router-link>
        <router-link to="/contact" class="nav-link" active-class="active">{{ t('nav.contact') }}</router-link>
      </nav>
      <div class="nav-actions">
        <LanguageSwitcher />
        <!-- AI 生成按钮 -->
        <button class="btn btn-ai" @click="$emit('openAI')">
          <span class="ai-btn-icon">✦</span>
          <span class="ai-btn-text">{{ t('nav.ai') || 'AI 生成' }}</span>
        </button>
        <router-link to="/contact" class="btn btn-primary btn-nav-cta">{{ t('nav.cta') }}</router-link>
      </div>
      <button class="menu-toggle" :class="{ active: mobileOpen }" @click="toggleMobile" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <div class="mobile-menu" :class="{ open: mobileOpen }">
    <router-link to="/" class="nav-link" @click="closeMobile">{{ t('nav.home') }}</router-link>
    <router-link to="/about" class="nav-link" @click="closeMobile">{{ t('nav.about') }}</router-link>
    <router-link to="/products" class="nav-link" @click="closeMobile">{{ t('nav.products') }}</router-link>
    <router-link to="/contact" class="nav-link" @click="closeMobile">{{ t('nav.contact') }}</router-link>
    <!-- 移动端 AI 按钮 -->
    <button class="btn btn-ai btn-block" @click="closeMobile;$emit('openAI')" style="margin-top:12px;text-align:left">
      ✦ {{ t('nav.ai') || 'AI 生成头雕设计' }}
    </button>
    <router-link to="/contact" class="btn btn-primary btn-block btn-lg" style="margin-top:16px" @click="closeMobile">{{ t('nav.cta') }}</router-link>
    <div style="margin-top:16px"><LanguageSwitcher /></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'

const { t } = useI18n()
const navbarRef = ref(null)
const scrolled = ref(false)
const hidden = ref(false)
const mobileOpen = ref(false)

let lastY = 0
function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 100
  hidden.value = y > lastY && y > 200
  lastY = y
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function toggleMobile() { mobileOpen.value = !mobileOpen.value; document.body.style.overflow = mobileOpen.value ? 'hidden' : '' }
function closeMobile() { mobileOpen.value = false; document.body.style.overflow = '' }

defineEmits(['openAI'])
</script>
