<template>
  <main>
    <HeroCarousel />
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>{{ t('home.introTitle') }}</h2><p>{{ t('home.introSub') }}</p></div>
      </div>
      <div class="container" style="margin-bottom:48px">
        <div class="stats-grid">
          <div v-for="(n, i) in [8, 500, 200, 99]" :key="i" class="stat-item">
            <div class="stat-number">{{ n }}<span style="font-size:18px;font-weight:400">{{ stats[i] }}</span></div>
            <div class="stat-label">{{ statsLabel[i] }}</div>
          </div>
        </div>
      </div>
      <div class="container-content"><p style="text-align:center;max-width:800px;margin:0 auto">{{ t('home.introDesc') }}</p></div>
    </section>
    <FeaturedWorks @open-product="onOpenProduct" />
    <ProcessShowcase />
    <VideoGallery @open-video="onOpenVideo" />
    <PartnerSection />
    <section class="section-lg text-center" style="background:linear-gradient(180deg,var(--bg-primary) 0%,var(--bg-deep) 100%)">
      <div class="container-content">
        <h2>{{ t('home.ctaTitle') }}</h2>
        <p style="margin:16px 0 32px;color:var(--text-secondary)">{{ t('home.ctaDesc') }}</p>
        <router-link to="/contact" class="btn btn-primary btn-lg neon-pulse">{{ t('home.ctaBtn') }}</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTm } from '@/composables/useTm.js'
import { inject } from 'vue'
import HeroCarousel from '@/components/home/HeroCarousel.vue'
import FeaturedWorks from '@/components/home/FeaturedWorks.vue'
import ProcessShowcase from '@/components/home/ProcessShowcase.vue'
import VideoGallery from '@/components/home/VideoGallery.vue'
import PartnerSection from '@/components/home/PartnerSection.vue'

const { t } = useI18n()
const stats = useTm('home.stats')
const statsLabel = useTm('home.statsLabel')

const openProductModal = inject('openProductModal')
const openVideoModal = inject('openVideoModal')

function onOpenProduct(p) { if (openProductModal) openProductModal(p) }
function onOpenVideo(src) { if (openVideoModal) openVideoModal(src) }
</script>
