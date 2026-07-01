<template>
  <div id="app-root">
    <PageLoader />
    <AppNavbar @openAI="showAI = true" />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppFooter />
    <ProductModal ref="productModalRef" />
    <VideoExpandModal ref="videoModalRef" />
    <AIHeadSculptDialog :visible="showAI" @close="showAI = false" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import PageLoader from '@/components/layout/PageLoader.vue'
import ProductModal from '@/components/products/ProductModal.vue'
import VideoExpandModal from '@/components/shared/VideoExpandModal.vue'
import AIHeadSculptDialog from '@/components/layout/AIHeadSculptDialog.vue'

const productModalRef = ref(null)
const videoModalRef = ref(null)
const showAI = ref(false)

provide('openProductModal', (p) => productModalRef.value?.open(p))
provide('openVideoModal', (src) => videoModalRef.value?.open(src))
</script>

<style>
.page-enter-active { animation: fade-enter 0.4s cubic-bezier(0.16,1,0.3,1); }
.page-leave-active { animation: fade-exit 0.2s cubic-bezier(0.4,0,1,1); }
@keyframes fade-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-exit { from { opacity: 1; } to { opacity: 0; } }
</style>
