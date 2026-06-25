<template>
  <section class="carousel" ref="carouselRef">
    <div class="hero-grid-bg"></div>
    <div class="carousel-slides">
      <div v-for="(slide, i) in slides" :key="i" class="carousel-slide" :class="{ active: current === i }">
        <div class="carousel-slide-bg">
          <video v-if="slide.video" muted loop playsinline :poster="slide.poster">
            <source :src="slide.video" type="video/mp4" />
          </video>
          <img v-else :src="slide.img" :alt="slide.title" />
        </div>
        <div class="carousel-slide-overlay"></div>
        <div class="carousel-slide-content">
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.desc }}</p>
          <router-link :to="slide.link || '/products'" class="btn btn-primary btn-lg">
            {{ slide.btnText || t('home.heroCta') }}
          </router-link>
        </div>
      </div>
    </div>
    <div class="carousel-dots">
      <button v-for="(s, i) in slides" :key="i" class="carousel-dot" :class="{ active: current === i }" @click="goTo(i)"></button>
    </div>
    <button class="carousel-arrow carousel-arrow-prev" @click="prev">‹</button>
    <button class="carousel-arrow carousel-arrow-next" @click="next">›</button>
    <div class="scroll-indicator">
      <span class="scroll-indicator-arrow bounce-down">↓</span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const baseUrl = import.meta.env.BASE_URL

const carouselRef = ref(null)
const current = ref(0)
let timer = null

const slides = [
  { video: baseUrl + 'VIDEO/1.mp4', poster: baseUrl + 'IMG/2.jpg', title: t('home.slide1Title'), desc: t('home.slide1Desc'), link: '/products' },
  { img: baseUrl + 'IMG/4.jpg', title: t('home.slide2Title'), desc: t('home.slide2Desc'), link: '/products' },
  { img: baseUrl + 'IMG/5.jpg', title: t('home.slide3Title'), desc: t('home.slide3Desc'), link: '/products' },
  { video: baseUrl + 'VIDEO/2.mp4', poster: baseUrl + 'IMG/3.jpg', title: t('home.slide4Title'), desc: t('home.slide4Desc'), link: '/about', btnText: t('home.slide6Cta') },
  { video: baseUrl + 'VIDEO/3.mp4', poster: baseUrl + 'IMG/6.jpg', title: t('home.slide5Title'), desc: t('home.slide5Desc'), link: '/about', btnText: t('home.slide6Cta') },
  { video: baseUrl + 'VIDEO/10.mp4', poster: baseUrl + 'IMG/7.jpg', title: t('home.slide6Title'), desc: t('home.slide6Desc'), link: '/about', btnText: t('home.slide6Cta') },
]

function goTo(i) { current.value = i; resetTimer() }
function next() { current.value = (current.value + 1) % slides.length; resetTimer() }
function prev() { current.value = (current.value - 1 + slides.length) % slides.length; resetTimer() }
function startTimer() { stopTimer(); timer = setInterval(next, 5000) }
function stopTimer() { if (timer) clearInterval(timer) }
function resetTimer() { stopTimer(); startTimer() }

onMounted(() => {
  startTimer()
  if (carouselRef.value) {
    carouselRef.value.addEventListener('mouseenter', stopTimer)
    carouselRef.value.addEventListener('mouseleave', startTimer)
  }
})
onUnmounted(stopTimer)
</script>
