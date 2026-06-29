<template>
  <Teleport to="body">
    <div class="modal-backdrop" :class="{ open: visible }" @click.self="close">
      <div class="modal" style="max-width:90vw;max-height:90vh;padding:16px;background:var(--bg-deep)">
        <button class="modal-close" @click="close" style="color:var(--text-primary);background:rgba(255,255,255,0.1)">&times;</button>
        <video ref="playerRef" controls autoplay playsinline style="width:100%;max-height:80vh;border-radius:8px" :key="videoKey">
          <source :src="videoSrc" type="video/mp4" />
        </video>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const visible = ref(false)
const videoSrc = ref('')
const videoKey = ref(0)
const playerRef = ref(null)

function open(src) {
  videoSrc.value = src
  videoKey.value++
  visible.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    setTimeout(() => {
      if (playerRef.value) playerRef.value.load()
      setTimeout(() => { if (playerRef.value) playerRef.value.play().catch(() => {}) }, 200)
    }, 100)
  })
}
function close() {
  visible.value = false
  document.body.style.overflow = ''
  if (playerRef.value) { playerRef.value.pause(); playerRef.value.currentTime = 0 }
}
defineExpose({ open, close })
</script>
