<template>
  <span class="pixel-text" :aria-label="text">
    <span class="pixel-text__size" aria-hidden="true">{{ text }}</span>
    <span class="pixel-text__value" aria-hidden="true">{{ value }}</span>
  </span>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
const props = defineProps({ text: { type: String, required: true }, active: Boolean });
const value = ref(props.text);
const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_+';
let timer;
watch(() => props.active, (active) => {
  clearInterval(timer);
  value.value = props.text;
  if (!active || prefersReducedMotion()) return;
  let step = 0;
  timer = setInterval(() => {
    const resolved = Math.floor(Math.max(0, ++step - 2) / 2);
    value.value = [...props.text].map((char, i) =>
      char === ' ' || i < resolved ? char : glyphs[Math.floor(Math.random() * glyphs.length)],
    ).join('');
    if (resolved >= props.text.length) {
      clearInterval(timer);
      value.value = props.text;
    }
  }, 28);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
.pixel-text { display: inline-grid; white-space: pre; }
.pixel-text__size, .pixel-text__value { grid-area: 1 / 1; }
.pixel-text__size { visibility: hidden; }
.pixel-text__value { text-transform: none; }
</style>
