<template>
  <main>
    <div class="container"><div class="breadcrumb"><router-link to="/">{{ t('nav.home') }}</router-link><span>/</span><span>{{ t('nav.about') }}</span></div></div>
    <section class="section" style="padding-top:48px">
      <div class="container"><div class="section-header"><h1>{{ t('about.heroTitle') }}</h1><p>{{ t('about.heroSub') }}</p></div></div>
    </section>
    <section class="section" style="background:var(--bg-primary)">
      <div class="container-content">
        <div class="section-header"><h2>{{ t('about.storyTitle') }}</h2></div>
        <p>{{ t('about.storyP1') }}</p><p style="margin:16px 0">{{ t('about.storyP2') }}</p><p>{{ t('about.storyP3') }}</p>
      </div>
      <div class="container" style="margin-top:64px">
        <div class="stats-grid">
          <div v-for="(s, i) in aboutStats" :key="i" class="stat-item"><div class="stat-number">{{ s[0] }}</div><div class="stat-label">{{ s[1] }}</div></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container-content">
        <div class="section-header"><h2>{{ t('about.processTitle') }}</h2></div>
        <div class="timeline">
          <div v-for="(s, i) in processSteps" :key="i" class="timeline-item">
            <h4>{{ s }}</h4><p>{{ processDescs[i] }}</p>
          </div>
        </div>
      </div>
    </section>
    <!-- <section class="section" style="background:var(--bg-primary)">
      <div class="container">
        <div class="section-header"><h2>{{ t('about.teamTitle') }}</h2><p>{{ t('about.teamSub') }}</p></div>
        <div class="grid grid-4">
          <div v-for="(m, i) in team" :key="i" class="card-team">
            <div class="card-team-avatar"><img :src="`${baseUrl}IMG/${[3,5,6,7][i]}.jpg`" :alt="m.name" loading="lazy" /></div>
            <div class="card-team-body"><h4>{{ m.name }}</h4><div class="card-team-role">{{ m.role }}</div><p>{{ m.desc }}</p></div>
          </div>
        </div>
      </div>
    </section> -->
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>{{ t('about.equipTitle') }}</h2><p>{{ t('about.equipSub') }}</p></div>
        <div class="grid grid-3">
          <div v-for="(e, i) in equipment" :key="i" class="card-process">
            <div class="card-process-step">{{ String(i+1).padStart(2,'0') }}</div>
            <div class="card-process-icon">◆</div>
            <h4>{{ e.title }}</h4><p>{{ e.desc }}</p>
            <div class="card-process-line"></div>
          </div>
        </div>
      </div>
    </section>
    <section class="section-lg text-center" style="background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg-primary) 100%)">
      <div class="container-content">
        <h2>{{ t('home.ctaTitle') }}</h2>
        <p style="margin:16px 0 32px;color:var(--text-secondary)">{{ t('home.ctaDesc') }}</p>
        <router-link to="/contact" class="btn btn-primary btn-lg">{{ t('home.ctaBtn') }}</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
const baseUrl = import.meta.env.BASE_URL
const aboutStats = computed(() => tm('about.stats'))
const processSteps = computed(() => tm('about.processSteps'))
const processDescs = computed(() => tm('about.processDescs'))
const team = computed(() => tm('about.team'))
const equipment = computed(() => tm('about.equipment'))
</script>
