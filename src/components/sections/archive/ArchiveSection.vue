<template>
  <section class="archive">
    <template v-if="!isCompact">
      <ArchiveSequence
        id="archive-intro"
        handoff="opening"
        :frames="openingFrames"
        :span="4"
        :intro-hold="0.18"
        :intro-exit="0.12"
        :intro-layout="introLayout"
        reduced-frame="first"
      >
        <template #intro>
          <div class="archive__intro" :style="introVars">
            <ArchiveCopy as="h1" class="archive__headline" :text="'See what\nwe’ve made\nreal.'" />
            <ArchiveCopy as="p" class="archive__lead" :text="LEAD" />
          </div>
        </template>
      </ArchiveSequence>

      <ArchiveList ref="listRef" class="archive__listing" :projects="PROJECTS" />

      <ArchiveSequence
        id="archive-outro"
        handoff="ending"
        :frames="endingFrames"
        :span="3"
        :outro-hold="1"
        :outro-scale="0.76"
        :hotspots="OUTRO_HOTSPOTS"
        reduced-frame="last"
      >
        <template #overlay="{ rects }">
          <div class="archive__actions" :style="rects.actions">
            <button
              type="button"
              class="archive__btn archive__btn--primary mask-icon-before mask-icon-after"
              @click="openContactModal"
            >
              <span class="archive__btn-label">Start a Project</span>
            </button>
            <RouterLink
              class="archive__btn mask-icon-before mask-icon-after"
              to="/#process"
            >
              <span class="archive__btn-label">How We Work?</span>
            </RouterLink>
          </div>
        </template>
      </ArchiveSequence>
    </template>

    <template v-else>
      <section class="archive__panel">
        <div class="container">
          <h1 class="archive__headline archive__headline--flow">
            See what we’ve<br />made real.
          </h1>
          <p class="archive__lead archive__lead--flow">{{ LEAD }}</p>

          <div class="archive__device">
            <img
              :src="deviceImg"
              alt=""
              width="390"
              height="350"
              loading="lazy"
              decoding="async"
            />
            <div class="archive__device-screen">
              <p class="archive__device-title">ENTER THE ARCHIVE</p>
              <p class="archive__device-hint">Scroll to explore</p>
              <p class="archive__device-arrow" aria-hidden="true">↓</p>
            </div>
          </div>
        </div>
      </section>

      <ArchiveList ref="listRef" :projects="PROJECTS" />

      <section class="archive__panel">
        <div class="container">
          <div class="archive__device">
            <img
              :src="deviceImg"
              alt=""
              width="390"
              height="350"
              loading="lazy"
              decoding="async"
            />
            <div class="archive__device-screen">
              <p class="archive__device-title">LIKE WHAT<br />YOU’VE SEEN?</p>
              <p class="archive__device-hint">
                Let’s create something worth showing.
              </p>
              <div class="archive__actions archive__actions--flow">
                <button
                  type="button"
                  class="archive__btn archive__btn--primary mask-icon-before mask-icon-after"
                  @click="openContactModal"
                >
                  <span class="archive__btn-label">Start a Project</span>
                </button>
                <RouterLink
                  class="archive__btn mask-icon-before mask-icon-after"
                  to="/#process"
                >
                  <span class="archive__btn-label">How We Work?</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { usePixelChrome } from '@/composables/usePixelChrome';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

import ArchiveSequence from './ArchiveSequence.vue';
import ArchiveList from './ArchiveList.vue';
import ArchiveCopy from './ArchiveCopy.vue';
import { PROJECTS } from '@/content/projects.data.js';
import { framesFromGlob } from '@/composables/useImageSequence';
import deviceImg from '@/assets/images/archive/mobile-device.webp';
import { useContactModal } from '@/composables/useContactModal';
import { below, useMediaQuery } from '@/composables/useBreakpoints';

const { open: openContactModal } = useContactModal();

const LEAD =
  'A look at the projects, partnerships and client relationships we’ve built along the way.';

const listRef = ref(null);
const { setPixelChrome } = usePixelChrome();
let chromeTrigger = null;
let listReveal = null;
let canvasHandoff = null;

const openingFrames = framesFromGlob(
  import.meta.glob('@/assets/images/archive/opening/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);

const endingFrames = framesFromGlob(
  import.meta.glob('@/assets/images/archive/ending/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);

const INTRO_SCENE = {
  width: 1920,
  height: 1334,
  frame: { x: 32, y: 323, scale: 0.955 },
};

const introVars = {
  '--scene-w': INTRO_SCENE.width,
  '--scene-h': INTRO_SCENE.height,
};

function introLayout(boxW, boxH) {
  const { width, height, frame } = INTRO_SCENE;
  const unit = Math.min(boxW / width, boxH / height);
  const top = Math.max(0, (boxH - height * unit) / 2);
  const drawW = 1920 * frame.scale * unit;

  return {
    offsetX: boxW / 2 + (frame.x - width / 2) * unit,
    offsetY: top + frame.y * unit,
    drawW,
    drawH: (drawW * 1080) / 1920,
  };
}

const OUTRO_HOTSPOTS = [{ key: 'actions', x: 784, y: 410, w: 348, h: 38 }];

const isCompact = useMediaQuery(below('mobile'));

function watchChrome(host) {
  canvasHandoff?.revert();
  canvasHandoff = null;
  listReveal?.revert();
  listReveal = null;
  chromeTrigger?.kill();
  chromeTrigger = null;
  setPixelChrome(false);

  if (!host) return;

  // Use the same scroll coordinates as the surrounding pinned scenes.
  chromeTrigger = ScrollTrigger.create({
    trigger: host,
    start: 'top 12%',
    end: 'bottom 80%',
    refreshPriority: -1,
    onToggle: (self) => setPixelChrome(self.isActive),
    onRefresh: (self) => setPixelChrome(self.isActive),
  });
  setPixelChrome(chromeTrigger.isActive);

  if (!isCompact.value && !prefersReducedMotion()) {
    const canvas = host.previousElementSibling?.querySelector('.seq__canvas');
    if (canvas) canvasHandoff = gsap.fromTo(canvas, { autoAlpha: 1 }, {
      autoAlpha: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: host, start: 'top 30%', end: 'top 12%', scrub: 0.2, invalidateOnRefresh: true },
    });
    listReveal = gsap.fromTo(host, { autoAlpha: 0 }, {
      autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: host, start: 'top 12%', end: 'top top', scrub: 0.2, invalidateOnRefresh: true },
    });
  }
}

watch(listRef, (list) => watchChrome(list?.$el ?? null), { flush: 'post' });

onBeforeUnmount(() => {
  canvasHandoff?.revert();
  listReveal?.revert();
  chromeTrigger?.kill();

  setPixelChrome(false);
});
</script>

<style scoped>
@media (width >= 768px) and (prefers-reduced-motion: no-preference) {
  .archive__listing { margin-top: -100dvh; }
}

.archive__intro {
  --u: calc(100cqw / var(--scene-w));
  --v: min(var(--u), calc(100cqh / var(--scene-h)));
  --top: max(0px, calc((100cqh - var(--scene-h) * var(--v)) / 2));

  position: absolute;
  inset: 0;
  container-type: size;
}

.archive__headline {
  position: absolute;
  top: calc(var(--top) + 170 * var(--v));
  left: calc(362 * var(--u));
  margin: 0;
  color: var(--blue-100);
  font-family: var(--font-primary);
  font-size: calc(92 * var(--v));
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.archive__lead {
  position: absolute;
  top: calc(var(--top) + 738 * var(--v));
  left: calc(1335 * var(--u));
  right: calc(240 * var(--u));
  margin: 0;
  color: var(--black-900);
  font-family: var(--font-mono);
  font-size: max(13px, calc(20 * var(--v)));
  font-weight: 500;
  line-height: 1.3;
}

@media (max-aspect-ratio: 1 / 1) {
  .archive__intro .archive__lead {
    top: calc(var(--top) + 1300 * var(--v));
    left: calc(362 * var(--u));
    right: auto;
    width: max(260px, calc(345 * var(--u)));
  }
}

.archive__actions {
  position: absolute;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: calc(28px * var(--seq-scale, 1));
}

.archive__btn {
  --mask-src: url('@/assets/icons/archive/btn-plate.svg');
  --mask-size: 100% 100%;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: calc(7px * var(--seq-scale, 1)) calc(12px * var(--seq-scale, 1));
  color: var(--pixel-orange);
  font-family: var(--font-display);
  font-size: calc(21px * var(--seq-scale, 1));
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.3s var(--transition-timing);
  --shift: calc(4px * var(--seq-scale, 1));
  --press: 0px;
  --squash: 1;
}

.archive__btn::before,
.archive__btn-label {
  translate: var(--press) var(--press);
  scale: var(--squash);
  transition:
    translate 0.25s var(--transition-timing),
    scale 0.15s var(--transition-timing),
    background-color 0.3s var(--transition-timing);
}

.archive__btn-label {
  position: relative;
  display: block;
}

.archive__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--white);
}

.archive__btn::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  translate: var(--shift) var(--shift);
  background-color: var(--pixel-orange);
  transition: background-color 0.3s var(--transition-timing);
}

.archive__btn--primary {
  color: var(--white);
}

.archive__btn--primary::before {
  background-color: var(--pixel-orange);
}

.archive__btn--primary::after {
  background-color: var(--white);
}

.archive__btn:hover,
.archive__btn:focus-visible {
  --press: var(--shift);
  color: var(--white);
}

.archive__btn:active {
  --squash: 0.94;
}

.archive__btn:hover::before,
.archive__btn:focus-visible::before {
  background-color: var(--pixel-orange);
}

.archive__btn--primary:hover,
.archive__btn--primary:focus-visible {
  color: var(--pixel-orange);
}

.archive__btn--primary:hover::before,
.archive__btn--primary:focus-visible::before {
  background-color: var(--white);
}

.archive__btn--primary:hover::after,
.archive__btn--primary:focus-visible::after {
  background-color: var(--pixel-orange);
}

.archive__btn:focus-visible {
  outline: 2px solid var(--white);
  outline-offset: calc(4px * var(--seq-scale, 1));
}

.archive__panel {
  padding: 96px 0 56px;
}

.archive__headline--flow {
  position: static;
  font-size: clamp(32px, 9vw, 40px);
  font-weight: 600;
  line-height: 1.08;
}

.archive__lead--flow {
  position: static;
  grid-column: auto;
  justify-self: auto;
  margin-top: 18px;
  max-width: 34ch;
  font-size: 16px;
}

.archive__device {
  position: relative;
  margin-top: 40px;
}

.archive__device img {
  display: block;
  width: 100%;
  height: auto;
}

.archive__device-screen {
  position: absolute;
  left: 15.6%;
  top: 12.3%;
  width: 68.8%;
  height: 42.3%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  color: var(--white);
  text-align: center;
  container-type: inline-size;
}

.archive__device-title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(13px, 4.4vw, 19px);
  font-weight: 600;
  line-height: 1.2;
}

.archive__device-hint {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(9px, 2.6vw, 11px);
  line-height: 1.4;
}

.archive__device-arrow {
  margin: 0;
  font-size: 18px;
  line-height: 1;
}

.archive__actions--flow {
  --u: calc(100cqw / 237.68);
  position: static;
  margin-top: calc(12 * var(--u) - 6px);
  gap: calc(8.781 * var(--u));
}

.archive__actions--flow .archive__btn {
  padding: calc(2.195 * var(--u)) calc(5.488 * var(--u));
  font-size: calc(10 * var(--u));
  line-height: 1;
}

.archive__actions--flow .archive__btn {
  --shift: calc(1.098 * var(--u));
}

@media (prefers-reduced-motion: reduce) {
  .archive__btn,
  .archive__btn::before,
  .archive__btn::after,
  .archive__btn-label {
    transition: none;
  }
}
</style>
