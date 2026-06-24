<template>
  <section class="section" style="background:var(--bg-primary)">
    <div class="container">
      <div class="section-header"><h2>{{ t('home.featuredTitle') }}</h2><p>{{ t('home.featuredSub') }}</p></div>
      <div class="grid grid-3">
        <div v-for="p in featured" :key="p.id" class="card-portfolio featured" @click="$emit('openProduct', p)" role="button" tabindex="0">
          <div class="card-portfolio-img">
            <img :src="p.image" :alt="isZh ? p.name : p.nameEn" loading="lazy" />
          </div>
          <div class="card-portfolio-body">
            <h4>{{ isZh ? p.name : p.nameEn }}</h4>
            <div class="card-portfolio-tags">
              <span class="tag tag-gold">{{ isZh ? p.category : p.categoryEn }}</span>
            </div>
            <span class="card-portfolio-meta">{{ isZh ? p.size : p.sizeEn }}</span>
          </div>
        </div>
      </div>
      <div class="text-center mt-lg">
        <router-link to="/products" class="btn btn-secondary btn-lg">{{ t('home.featuredCta') }}</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { products } from '@/data/products.js'

const { t, locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')
const featured = computed(() => products.filter(p => p.featured))

defineEmits(['openProduct'])
</script>
