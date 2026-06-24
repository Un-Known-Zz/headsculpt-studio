<template>
  <Teleport to="body">
    <div class="page-loader" :class="{ hidden: !visible }" v-if="mounted">
      <div class="loader-ring"></div>
      <div class="loader-text">Loading</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const visible = ref(true)
const mounted = ref(true)

onMounted(() => {
  setTimeout(() => { visible.value = false }, 600)
  window.addEventListener('load', () => {
    setTimeout(() => { visible.value = false }, 400)
  })
})
</script>
