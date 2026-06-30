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
        <!-- <div class="footer-col">
          <h4>{{ t('footer.services') }}</h4>
          <router-link v-for="s in serviceItems" :key="s" to="/contact">{{ s }}</router-link>
        </div> -->
        <div class="footer-col">
          <h4>{{ t('footer.contact') }}</h4>
          <a href="mailto:2960772239@qq.com">2960772239@qq.com</a>
          <a href="tel:+8618033080824">+86 180-3308-0824</a>
          <a href="#" @click.prevent="showWechatQr = true" class="wechat-link">WeChat：18033080824</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>{{ t('footer.copyright') }} 1.15</span>
      </div>
    </div>
    <!-- 微信二维码弹窗 -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ open: showWechatQr }" @click.self="showWechatQr = false">
        <div class="modal wechat-qr-modal">
          <button class="modal-close" @click="showWechatQr = false">&times;</button>
          <img :src="wechatQrImg" alt="WeChat QR" style="max-width:280px;border-radius:12px" />
          <p style="margin-top:12px;color:var(--text-secondary);font-size:14px;text-align:center">微信扫码添加：18033080824</p>
        </div>
      </div>
    </Teleport>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
const serviceItems = computed(() => tm('footer.serviceItems'))
const showWechatQr = ref(false)
const wechatQrImg = import.meta.env.BASE_URL + 'IMG/WeChat.jpg'
</script>
