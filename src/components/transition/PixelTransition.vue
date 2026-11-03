<template>
  <canvas
    ref="canvasRef"
    class="pixel-transition"
    :class="{ 'is-active': isCovered }"
    aria-hidden="true"
  ></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  registerPixelCanvas,
  usePixelTransition,
} from '@/composables/usePixelTransition';

const canvasRef = ref(null);
const { isCovered } = usePixelTransition();

onMounted(() => registerPixelCanvas(canvasRef.value));
onBeforeUnmount(() => registerPixelCanvas(null));
</script>

<style scoped>
.pixel-transition {
  position: fixed;
  inset: 0;
  z-index: 9500;
  width: 100%;
  height: 100%;
  color: #6da4fd;
  pointer-events: none;
  visibility: hidden;
}

.pixel-transition.is-active {
  pointer-events: auto;
  visibility: visible;
}
</style>
