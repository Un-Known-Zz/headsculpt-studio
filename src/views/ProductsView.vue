<template>
  <main>
    <div class="container"><div class="breadcrumb"><router-link to="/">{{ t('nav.home') }}</router-link><span>/</span><span>{{ t('nav.products') }}</span></div></div>
    <section class="section" style="padding-top:48px">
      <div class="container"><div class="section-header"><h1>{{ t('products.title') }}</h1><p>{{ t('products.sub') }}</p></div></div>
    </section>
    
    <!-- 图片/视频 Tab 切换 -->
    <div class="container">
      <div class="filter-bar">
        <button class="filter-btn" :class="{ active: tab === 'image' }" @click="tab = 'image'">{{ t('products.imageTab') || '图片' }}</button>
        <button class="filter-btn" :class="{ active: tab === 'video' }" @click="tab = 'video'">{{ t('products.videoTab') || '视频' }}</button>
      </div>
    </div>

    <!-- 图片作品网格 -->
    <section v-if="tab === 'image'" class="section" style="padding-top:32px;background:var(--bg-primary)">
      <div class="container">
        <div class="grid grid-3">
          <div v-for="p in imageProducts" :key="p.id" class="card-portfolio" :class="{ featured: p.featured }" @click="openProduct(p)" role="button" tabindex="0">
            <div class="card-portfolio-img"><img :src="baseUrl + p.image" :alt="p.name" loading="lazy" /></div>
            <div class="card-portfolio-body">
              <h4>{{ locale === 'zh' || locale === 'vi' || locale === 'th' ? p.name : p.nameEn }}</h4>
              <div class="card-portfolio-tags">
                <span class="tag tag-gold">{{ p.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 视频作品网格 -->
    <section v-if="tab === 'video'" class="section" style="padding-top:32px;background:var(--bg-primary)">
      <div class="container">
        <div class="video-grid">
          <div v-for="(v, i) in videoProducts" :key="i" class="video-card" @click="openVideo(v.src)">
            <div class="video-card-thumb">
              <img :src="`${baseUrl}VIDEO/thumbs/${i + 1}.jpg`" :alt="v.title" loading="lazy" />
            </div>
            <div class="video-card-info"><h4>{{ v.title }}</h4><span class="tag tag-gold">{{ v.tag }}</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-lg text-center" style="background:linear-gradient(180deg,var(--bg-primary) 0%,var(--bg-deep) 100%)">
      <div class="container-content">
        <h2>{{ t('home.ctaTitle') }}</h2>
        <p style="margin:16px 0 32px;color:var(--text-secondary)">{{ t('home.ctaDesc') }}</p>
        <router-link to="/contact" class="btn btn-primary btn-lg">{{ t('home.ctaBtn') }}</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { products } from '@/data/products.js'

const { t, locale } = useI18n()
const baseUrl = import.meta.env.BASE_URL
const tab = ref('image')
const openProductModal = inject('openProductModal')
const openVideoModal = inject('openVideoModal')

const imageProducts = products

const videoTitles = ['头雕制作过程','精细雕刻实录','上色工艺展示','细节精修实录','眼睛安装实录','成品展示视频','发丝植入实录','3D打印过程','表面打磨实录','底漆喷涂实录','质检包装实录','成品鉴赏视频','制作实录一','制作实录二']
const videoTags = ['工艺展示','工艺展示','涂装工艺','工艺展示','细节工艺','作品展示','细节工艺','制作工艺','精修工艺','涂装工艺','品质管控','作品展示','工艺展示','工艺展示']
const videoPosters = [baseUrl + 'IMG/1.png',baseUrl + 'IMG/2.jpg',baseUrl + 'IMG/3.jpg',baseUrl + 'IMG/4.jpg',baseUrl + 'IMG/5.jpg',baseUrl + 'IMG/6.jpg',baseUrl + 'IMG/2.jpg',baseUrl + 'IMG/2.jpg',baseUrl + 'IMG/3.jpg',baseUrl + 'IMG/4.jpg',baseUrl + 'IMG/5.jpg',baseUrl + 'IMG/6.jpg',baseUrl + 'IMG/3.jpg',baseUrl + 'IMG/2.jpg']

const videoProducts = Array.from({ length: 14 }, (_, i) => ({
  title: videoTitles[i] || `视频 ${i + 1}`,
  tag: videoTags[i] || '作品展示',
  src: baseUrl + `VIDEO/${i + 1}.mp4`,
  poster: videoPosters[i] || baseUrl + 'IMG/2.jpg',
}))

function openProduct(p) { if (openProductModal) openProductModal(p) }
function openVideo(src) { if (openVideoModal) openVideoModal(src) }
</script>
