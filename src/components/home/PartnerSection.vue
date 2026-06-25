<template>
  <section class="section-sm" style="background:var(--bg-primary)">
    <div class="container">
      <div class="section-header"><h2>{{ t('home.partnersTitle') }}</h2><p>{{ t('home.partnersSub') }}</p></div>
      <div class="partner-grid">
        <div v-for="p in partners" :key="p" class="partner-item">{{ p }}</div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const partners = computed(() => t('home.partners'))
</script>
