<template>
  <Teleport to="body">
    <div class="modal-backdrop" :class="{ open: visible }" @click.self="close">
      <div class="modal modal-product" v-if="product">
        <div class="modal-product-body">
          <div class="modal-product-img" @click="zoomImage">
            <img :src="product.image" :alt="product.name" ref="modalImgRef" style="cursor:zoom-in" />
            <div class="zoom-hint" v-if="!zoomed">{{ t('modal.clickToZoom') || '点击放大' }}</div>
          </div>
          <div class="modal-product-info">
            <button class="modal-close" @click="close">&times;</button>
            <h2>{{ product.name }}</h2>
            <div class="modal-product-tags">
              <span class="tag tag-gold">{{ product.category }}</span>
              <span v-if="product.featured" class="tag tag-cyan">{{ t('modal.featured') }}</span>
            </div>
            <dl class="modal-product-detail">
              <dt>{{ t('modal.material') }}</dt><dd>{{ product.material }}</dd>
              <dt>{{ t('modal.size') }}</dt><dd>{{ product.size }}</dd>
            </dl>
            <p class="modal-product-desc">{{ product.description }}</p>
            <router-link to="/contact" class="btn btn-primary btn-lg" style="align-self:flex-start" @click="close">
              {{ t('modal.cta') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <!-- 图片放大层 -->
    <Teleport to="body">
      <div v-if="zoomed" class="image-zoom-overlay" @click="zoomed = false">
        <button class="modal-close image-zoom-close" @click="zoomed = false">&times;</button>
        <img :src="product.image" :alt="product.name" class="image-zoom-img" @click.stop />
      </div>
    </Teleport>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = ref(false)
const product = ref(null)
const zoomed = ref(false)

function open(p) { product.value = p; visible.value = true; zoomed.value = false; document.body.style.overflow = 'hidden' }
function close() { visible.value = false; zoomed.value = false; document.body.style.overflow = '' }
function zoomImage() { zoomed.value = true }

defineExpose({ open, close })
</script>

<style scoped>
.zoom-hint {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(0,0,0,0.6); color: var(--accent-gold); font-size: 11px;
  padding: 4px 10px; border-radius: 4px; pointer-events: none;
}
.image-zoom-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  cursor: zoom-out;
}
.image-zoom-img {
  max-width: 95vw; max-height: 95vh;
  object-fit: contain; border-radius: 4px;
}
.image-zoom-close {
  position: fixed; top: 16px; right: 16px;
  z-index: 2001; width: 40px; height: 40px;
  color: #fff; background: rgba(255,255,255,0.15);
  border-radius: 50%; font-size: 24px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
</style>
