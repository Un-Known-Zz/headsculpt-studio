<template>
  <div class="lang-dropdown" ref="dropdownRef">
    <button class="lang-dropdown-btn" @click="open = !open">
      <span>{{ currentLabel }}</span>
      <span class="lang-dropdown-arrow" :class="{ open }">▼</span>
    </button>
    <div class="lang-dropdown-menu" :class="{ open }">
      <button v-for="l in langs" :key="l.code"
        class="lang-dropdown-item" :class="{ active: l.code === locale }"
        @click="switchLang(l.code)">{{ l.native }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLang, supportedLangs } from '@/i18n/index.js'

const { locale } = useI18n()
const open = ref(false)
const dropdownRef = ref(null)

const langs = [
  { code: 'zh', label: '中', native: '中文' },
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'vi', label: 'VN', native: 'Tiếng Việt' },
  { code: 'th', label: 'TH', native: 'ภาษาไทย' },
]

const currentLabel = computed(() => {
  const l = langs.find(l => l.code === locale.value)
  return l ? l.native : '中文'
})

function switchLang(code) {
  setLang(code)
  open.value = false
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.lang-dropdown { position: relative; }
.lang-dropdown-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--radius-md);
  background: var(--bg-surface); border: var(--border-thin);
  color: var(--text-primary); cursor: pointer;
  font-size: 13px; font-weight: 500; white-space: nowrap;
  transition: all var(--duration-fast) var(--ease-out);
}
.lang-dropdown-btn:hover { border-color: var(--border-emphasis); background: var(--bg-elevated); }
.lang-dropdown-arrow { font-size: 10px; transition: transform var(--duration-fast) var(--ease-out); margin-left: 2px; }
.lang-dropdown-arrow.open { transform: rotate(180deg); }
.lang-dropdown-menu {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: var(--bg-elevated); border: var(--border-emphasis);
  border-radius: var(--radius-md); overflow: hidden;
  box-shadow: var(--shadow-modal); min-width: 140px;
  opacity: 0; visibility: hidden; transform: translateY(-4px);
  transition: all var(--duration-fast) var(--ease-out); z-index: 100;
}
.lang-dropdown-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }
.lang-dropdown-item {
  display: block; width: 100%; padding: 10px 16px;
  background: none; border: none; color: var(--text-secondary);
  font-size: 13px; cursor: pointer; text-align: left;
  transition: all var(--duration-fast) var(--ease-out);
}
.lang-dropdown-item:hover { background: var(--bg-surface); color: var(--text-primary); }
.lang-dropdown-item.active { color: var(--accent-gold); background: rgba(212,168,67,0.08); }
</style>
