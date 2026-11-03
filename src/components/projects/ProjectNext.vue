<template>
  <RouterLink
    class="next-case"
    :to="{ name: 'project', params: { slug: project.slug } }"
  >
    <span ref="coverRef" class="next-case__cover">
      <ProjectThumb
        class="next-case__thumb"
        :still="project.thumb"
        :video="project.thumbVideo"
        :active="false"
      />
      <canvas
        ref="pixelsRef"
        class="next-case__pixels"
        aria-hidden="true"
      ></canvas>
    </span>

    <span class="next-case__plate">
      <span class="next-case__marker">//{{ marker }}</span>
      <span class="next-case__title">next: {{ project.title }}</span>
      <span class="next-case__arrow mask-icon" aria-hidden="true"></span>
    </span>
  </RouterLink>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import ProjectThumb from './ProjectThumb.vue';

const props = defineProps({
  project: { type: Object, required: true },
  marker: { type: Number, required: true },
});

const PIXEL_BLOCK = 12;
const MAX_TRIES = 40;
const RETRY_MS = 100;
const MEDIA_EVENTS = ['loadeddata', 'canplay', 'load'];

const coverRef = ref(null);
const pixelsRef = ref(null);

let media = null;
let resize = null;
let retryTimer = 0;
let tries = 0;

function retry() {
  if (tries >= MAX_TRIES) return;
  tries += 1;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(paint, RETRY_MS);
}

function paint() {
  const canvas = pixelsRef.value;
  if (!canvas || !media) return;

  const sw = media.videoWidth || media.naturalWidth;
  const sh = media.videoHeight || media.naturalHeight;
  const box = canvas.getBoundingClientRect();
  if (!sw || !sh || !box.width) return retry();

  canvas.width = Math.max(8, Math.round(box.width / PIXEL_BLOCK));
  canvas.height = Math.max(4, Math.round(box.height / PIXEL_BLOCK));

  const scale = Math.max(canvas.width / sw, canvas.height / sh);
  const dw = sw * scale;
  const dh = sh * scale;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(
    media,
    (canvas.width - dw) / 2,
    (canvas.height - dh) / 2,
    dw,
    dh,
  );

  if (ctx.getImageData(0, 0, 1, 1).data[3] === 0) retry();
}

function unbind() {
  MEDIA_EVENTS.forEach((name) => media?.removeEventListener(name, paint));
  clearTimeout(retryTimer);
  media = null;
}

function bind() {
  unbind();
  tries = 0;
  media = coverRef.value?.querySelector('video, img') ?? null;
  if (!media) return;

  MEDIA_EVENTS.forEach((name) => media.addEventListener(name, paint));
  paint();
}

watch(() => props.project.slug, bind, { flush: 'post' });

onMounted(() => {
  bind();
  resize = new ResizeObserver(paint);
  resize.observe(pixelsRef.value);
});

onBeforeUnmount(() => {
  unbind();
  resize?.disconnect();
});
</script>

<style scoped>
.next-case {
  container-type: size;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--archive-navy);
  color: var(--white);
  text-decoration: none;
}

.next-case__cover {
  position: relative;
  display: block;
  flex: 0 0 42%;
  overflow: hidden;
}

.next-case__thumb {
  width: 100%;
  height: 100%;
}

.next-case__pixels {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  transition: opacity 0.45s var(--transition-timing);
}

.next-case:hover .next-case__pixels,
.next-case:focus-visible .next-case__pixels {
  opacity: 0;
}

.next-case__plate {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2.3cqh;
  min-height: 0;
  padding: 4.6cqh 4.85cqw;
  font-family: var(--font-display);
}

.next-case__marker {
  color: var(--archive-lav);
  font-size: clamp(13px, 4cqh, 28px);
  line-height: 1;
  transition: color 0.35s var(--transition-timing);
}

.next-case__title {
  margin-top: 0.15em;
  color: var(--archive-lav);
  font-size: clamp(26px, 17.2cqh, 120px);
  line-height: 0.86;
  text-transform: uppercase;
  transition: color 0.35s var(--transition-timing);
}

.next-case:hover .next-case__marker,
.next-case:hover .next-case__title,
.next-case:focus-visible .next-case__marker,
.next-case:focus-visible .next-case__title {
  color: var(--white);
}

.next-case__arrow {
  width: clamp(70px, 25.1cqw, 166px);
  aspect-ratio: 166 / 78;
  flex-shrink: 0;
  margin-top: auto;
  --mask-src: url('@/assets/icons/archive/arrow-lg.svg');
  --mask-align: left center;
  background-color: #ababde;
  transition:
    translate 0.45s var(--transition-timing),
    background-color 0.35s var(--transition-timing);
}

.next-case:hover .next-case__arrow,
.next-case:focus-visible .next-case__arrow {
  translate: 2.7cqw 0;
  background-color: var(--white);
}

.next-case:focus-visible {
  outline: 2px solid var(--white);
  outline-offset: -6px;
}

@media (prefers-reduced-motion: reduce) {
  .next-case__pixels {
    transition: none;
  }
}
</style>
