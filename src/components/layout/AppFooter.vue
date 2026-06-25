<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>老李头<span>头雕</span></h3>
          <p>{{ t('footer.desc') }}</p>
        </div>
        <div class="footer-col">
          <h4>{{ t('footer.links') }}</h4>
          <router-link to="/">{{ t('nav.home') }}</router-link>
          <router-link to="/about">{{ t('nav.about') }}</router-link>
          <router-link to="/products">{{ t('nav.products') }}</router-link>
          <router-link to="/contact">{{ t('nav.contact') }}</router-link>
        </div>
        <div class="footer-col">
          <h4>{{ t('footer.contact') }}</h4>
          <a href="mailto:hello@headsculpt.studio">hello@headsculpt.studio</a>
          <a href="tel:+8613800000000">+86 138-0000-0000</a>
          <a href="#">WeChat: HeadSculptStudio</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>{{ t('footer.copyright') }} 1.04</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
