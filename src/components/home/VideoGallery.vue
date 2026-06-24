<template>
  <section class="section" style="background:var(--bg-primary)">
    <div class="container">
      <div class="section-header"><h2>{{ t('home.videoTitle') }}</h2><p>{{ t('home.videoSub') }}</p></div>
      <div class="video-grid">
        <div v-for="(v, i) in videoCards" :key="i" class="video-card" @click="$emit('openVideo', `/VIDEO/${i + 4}.mp4`)">
          <div class="video-card-thumb">
            <img :src="`/VIDEO/thumbs/${i + 4}.jpg`" :alt="v.title" loading="lazy" />
          </div>
          <div class="video-card-info"><h4>{{ v.title }}</h4><span :class="i % 2 === 0 ? 'tag tag-gold' : 'tag tag-cyan'">{{ v.tag }}</span></div>
        </div>
      </div>
      <div v-if="!showMore" class="text-center mt-lg">
        <button class="btn btn-secondary btn-lg" @click="showMore = true">{{ t('home.loadMore') }}</button>
      </div>
      <div v-if="showMore" class="video-grid" style="margin-top:24px">
        <div v-for="(v, i) in videoMore" :key="'m'+i" class="video-card" @click="$emit('openVideo', `/VIDEO/${i + 12}.mp4`)">
          <div class="video-card-thumb">
            <img :src="`/VIDEO/thumbs/${i + 12}.jpg`" :alt="v.title" loading="lazy" />
          </div>
          <div class="video-card-info"><h4>{{ v.title }}</h4><span class="tag tag-gold">{{ v.tag }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
const showMore = ref(false)
const videoCards = computed(() => tm('home.videoCards'))
const videoMore = computed(() => tm('home.videoMore'))
defineEmits(['openVideo'])
</script>
