<template>
  <div class="globe" aria-hidden="true">
    <canvas ref="canvas" class="globe__dots"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import artwork from '@/assets/images/why-us/planet.svg?raw';
import land from './land-mask.json';

const canvas = ref(null);
// Screen positions never move: the rotating 2D map controls dot radii only.
const color = artwork.match(/stroke="([^"]+)"/)?.[1] || '#0079e4';
const runs = Uint8Array.from(atob(land.runs), c => c.charCodeAt(0));
const mask = new Uint8Array(land.width * land.height);
let cursor = 0;
for (let i = 0; i < runs.length; i += 2) {
  mask.fill(runs[i + 1], cursor, cursor + runs[i]);
  cursor += runs[i];
}
const dots = [];
const SIZE = 700;
const CENTER = SIZE / 2;
const EXTENT = 346;
const STEP = 9;
for (let y = -EXTENT; y <= EXTENT; y += STEP) {
  const v = y / EXTENT;
  const rowExtent = Math.sqrt(1 - v * v);
  for (let x = -EXTENT; x <= EXTENT; x += STEP) {
    const u = x / EXTENT;
    if (u * u + v * v > 1) continue;
    dots.push({
      x: CENTER + x, y: CENTER + y,
      mapX: Math.asin(Math.max(-1, Math.min(1, u / Math.max(0.001, rowExtent)))) / (2 * Math.PI),
      mapY: (0.5 + Math.asin(v) / Math.PI) * (land.height - 1),
    });
  }
}
let resizeObserver, visibilityObserver, motionQuery;
let frame = 0, previousTime = 0, phase = 0;
let visible = false;
let reduced = false;
const WATER_RADIUS = 0.55;
const LAND_RADIUS = 2.9;
function sampleMap(x, y) {
  const wrapped = ((x % land.width) + land.width) % land.width;
  const x0 = Math.floor(wrapped), x1 = (x0 + 1) % land.width;
  const y0 = Math.floor(y), y1 = Math.min(land.height - 1, y0 + 1);
  const fx = wrapped - x0, fy = y - y0;
  const a = mask[y0 * land.width + x0] * (1 - fx) + mask[y0 * land.width + x1] * fx;
  const b = mask[y1 * land.width + x0] * (1 - fx) + mask[y1 * land.width + x1] * fx;
  return (a * (1 - fy) + b * fy) / 255;
}
function paint() {
  const el = canvas.value;
  if (!el?.clientWidth) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixels = Math.round(el.clientWidth * dpr);
  if (el.width !== pixels || el.height !== pixels) el.width = el.height = pixels;
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const unit = pixels / SIZE;
  ctx.setTransform(unit, 0, 0, unit, 0, 0);
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = color;
  // Map longitude advances continuously, even while scroll remains still.
  // Bilinear sampling and the filtered coastline grow/shrink adjacent dots
  // smoothly; water dots remain present throughout the cycle.
  const longitude = 0.5 + 15 / 360 - phase / (2 * Math.PI);
  ctx.beginPath();
  for (const dot of dots) {
    const coverage = sampleMap((dot.mapX + longitude) * land.width, dot.mapY);
    const radius = WATER_RADIUS + coverage * (LAND_RADIUS - WATER_RADIUS);
    ctx.moveTo(dot.x + radius, dot.y);
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
  }
  ctx.fill();
}
function tick(time) {
  frame = 0;
  if (previousTime && !reduced) phase += Math.min(0.06, (time - previousTime) / 1000) * 0.12;
  previousTime = time;
  paint();
  if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  paint();
  if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
}
function onMotion() { reduced = motionQuery.matches; sync(); }
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced = motionQuery.matches;
  motionQuery.addEventListener('change', onMotion);
  document.addEventListener('visibilitychange', sync);
  resizeObserver = new ResizeObserver(paint);
  resizeObserver.observe(canvas.value);
  visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  visibilityObserver.observe(canvas.value);
  paint();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  visibilityObserver?.disconnect();
  motionQuery?.removeEventListener('change', onMotion);
  document.removeEventListener('visibilitychange', sync);
});
</script>

<style scoped>
.globe { position: absolute; }
.globe__dots { display: block; width: 100%; height: 100%; }
</style>
