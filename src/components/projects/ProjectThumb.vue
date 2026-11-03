<template>
  <div class="thumb">
    <video
      v-if="video"
      ref="videoRef"
      class="thumb__media"
      :src="video"
      :poster="still || undefined"
      muted
      loop
      playsinline
      preload="metadata"
    ></video>
    <img
      v-else-if="still"
      class="thumb__media"
      :src="still"
      alt=""
      decoding="async"
      loading="lazy"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  still: { type: String, default: '' },
  video: { type: String, default: '' },
  active: { type: Boolean, default: false },
});

const videoRef = ref(null);

watch(
  () => props.active,
  (isActive) => {
    const el = videoRef.value;
    if (!el) return;

    if (isActive) {
      el.play?.().catch(() => {});
    } else {
      el.pause?.();
      el.currentTime = 0;
    }
  },
);
</script>

<style scoped>
.thumb {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: #d9d9d9;
}

.thumb__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
