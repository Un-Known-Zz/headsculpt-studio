<template>
  <section class="section">
    <div class="container">
      <div class="section-header"><h2>{{ t('home.processTitle') }}</h2><p>{{ t('home.processSub') }}</p></div>
      <div class="grid grid-3">
        <div v-for="(s, i) in processSteps" :key="i" class="card-process">
          <div class="card-process-step">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="card-process-icon">✦</div>
          <h4>{{ s.title }}</h4>
          <p>{{ s.desc }}</p>
          <div class="card-process-line"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTm } from '@/composables/useTm.js'
const { t } = useI18n()
const processSteps = useTm('home.processSteps')
</script>
