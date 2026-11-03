<template>
  <section id="home" ref="heroSection" class="hero">
    <div class="hero__visual">
    <Header hero />
    <div class="hero__background">
      <div class="hero__stage">
        <picture>
          <source :srcset="heroBgMobile" media="(width < 768px)" />
          <img :src="heroBg" alt="" fetchpriority="high" decoding="async" />
        </picture>
        <video
          ref="screenRef"
          class="hero__screen"
          :src="heroScreen"
          :poster="heroScreenPoster"
          muted
          loop
          playsinline
          preload="auto"
          aria-hidden="true"
        />
        <button
          type="button"
          class="hero__sound"
          :aria-label="isMuted ? 'Turn sound on' : 'Turn sound off'"
          :aria-pressed="!isMuted"
          @click="toggleSound"
        >
          <svg
            viewBox="0 0 12 12"
            shape-rendering="crispEdges"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="0" y="4" width="2" height="4" />
            <rect x="2" y="3" width="1" height="6" />
            <rect x="3" y="2" width="1" height="8" />
            <rect x="4" y="1" width="1" height="10" />
            <template v-if="isMuted">
              <rect x="7" y="4" width="1" height="1" />
              <rect x="8" y="5" width="1" height="1" />
              <rect x="9" y="6" width="1" height="1" />
              <rect x="10" y="7" width="1" height="1" />
              <rect x="11" y="8" width="1" height="1" />
              <rect x="11" y="4" width="1" height="1" />
              <rect x="10" y="5" width="1" height="1" />
              <rect x="8" y="7" width="1" height="1" />
              <rect x="7" y="8" width="1" height="1" />
            </template>
            <template v-else>
              <rect x="6" y="4" width="1" height="4" />
              <rect x="8" y="2" width="1" height="1" />
              <rect x="9" y="3" width="1" height="6" />
              <rect x="8" y="9" width="1" height="1" />
            </template>
          </svg>
        </button>
      </div>
    </div>
    <div class="container">
      <div class="hero__content">
        <div class="hero__text">
          <div class="hero__title-wrap">
            <h1
              ref="titleRef"
              class="hero__title"
              :class="{ 'hero__title--play': isGone }"
            >
              What does your <br />
              <span class="highlight">business</span> need<span
                class="highlight"
                >?</span
              >
            </h1>
            <HeroTags :revealed="titleSwept" />
          </div>
          <p class="hero__subtitle">
            Websites, AI video and advertising — built around your goals.
          </p>
        </div>

        <div class="hero__actions">
          <AppLink class="hero__cta" has-icon @click="openContactModal"
            >Start a Project</AppLink
          >
        </div>
      </div>
    </div>

    <div
      ref="caseRef"
      class="hero__case"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @focusin="isFocused = true"
      @focusout="isFocused = false"
    >
      <Transition name="case-swap" mode="out-in">
        <ProjectCard
          :key="active.slug"
          :slug="active.slug"
          :title="active.title"
          :meta="active.heroServices"
          :thumb="active.heroThumb"
          :thumb-video="active.thumbVideo"
        />
      </Transition>
    </div>
    </div>
    <div class="hero__whiteout" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import AppLink from '@/components/ui/AppLink.vue';
import ProjectCard from '@/components/projects/ProjectCard.vue';
import HeroTags from './HeroTags.vue';
import Header from '@/components/header/Header.vue';
import { CASE_STUDIES } from '@/content/projects.data.js';
import { useLoader } from '@/composables/useLoader';
import heroBg from '@/assets/images/hero-bg.webp';
import heroBgMobile from '@/assets/images/hero-bg-mobile.webp';
import heroScreen from '@/assets/images/hero-screen.mp4';
import heroScreenPoster from '@/assets/images/hero-screen-poster.webp';
import { useContactModal } from '@/composables/useContactModal';
import { useVideoAutoplay } from '@/composables/useVideoAutoplay';
import { gsap } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';

const heroSection = useScrollScene((root) => {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
      .to(root.querySelector('.hero__visual'), {
        scale: 0.9,
        filter: 'blur(5px)',
        ease: 'none',
      }, 0)
      .to(root.querySelector('.hero__whiteout'), {
        opacity: 1,
        ease: 'power1.inOut',
      }, 0);
  });
  return () => mm.revert();
});

const { open: openContactModal } = useContactModal();

const screenRef = ref(null);
useVideoAutoplay(() => screenRef.value);

const isMuted = ref(true);

const toggleSound = () => {
  const video = screenRef.value;
  if (!video) return;

  video.muted = !video.muted;
  isMuted.value = video.muted;
  if (!video.muted && video.paused) video.play().catch(() => {});
};

const HOLD_MS = 5000;

const index = ref(0);
const active = computed(() => CASE_STUDIES[index.value]);

const titleRef = ref(null);
const titleSwept = ref(false);

const caseRef = ref(null);
const isHovered = ref(false);
const isFocused = ref(false);
const isInView = ref(false);
const isPageVisible = ref(true);
const { isLoading, isGone } = useLoader();

watch(
  isGone,
  async (gone) => {
    if (!gone) return;
    await nextTick();
    const sweeps = titleRef.value?.getAnimations({ subtree: true }) ?? [];
    await Promise.allSettled(sweeps.map((sweep) => sweep.finished));
    titleSwept.value = true;
  },
  { immediate: true },
);

const shouldRotate = computed(
  () =>
    CASE_STUDIES.length > 1 &&
    !isHovered.value &&
    !isFocused.value &&
    isInView.value &&
    isPageVisible.value &&
    !isLoading.value,
);

let timer = null;

const stop = () => {
  clearInterval(timer);
  timer = null;
};

const start = () => {
  stop();
  timer = setInterval(() => {
    index.value = (index.value + 1) % CASE_STUDIES.length;
  }, HOLD_MS);
};

watch(shouldRotate, (rotate) => (rotate ? start() : stop()), {
  immediate: true,
});

let observer = null;
const onVisibility = () => {
  isPageVisible.value = !document.hidden;
};

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => (isInView.value = entry.isIntersecting),
  );
  if (caseRef.value) observer.observe(caseRef.value);

  document.addEventListener('visibilitychange', onVisibility);
});

onUnmounted(() => {
  stop();
  observer?.disconnect();
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>

<style scoped>
.hero {
  --bg-ratio: 1920 / 1086;
  --bg-ratio-num: 1.768;
  --bg-align-y: 50%;
  --screen-left: 31.875%;
  --screen-top: 36.556%;
  --screen-top-ratio: 0.36556;
  --screen-width: 36.25%;
  --screen-height: 36.188%;
  --hero-offset: 80px;
  --hero-sky: #0073f5;
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--white);
  display: flex;
}

.hero__visual {
  position: absolute;
  inset: 0;
  overflow: visible;
  padding-top: var(--hero-offset);
  display: flex;
  transform-origin: 50% 45%;
  isolation: isolate;
}

.hero__whiteout {
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0;
  background: var(--white);
  pointer-events: none;
}

/* The stage mimics object-fit: cover so the video stays pinned to the
   monitor's screen, measured in % of the background image. */
.hero__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  container-type: size;
  background: var(--hero-sky);
  /* Bleed beyond the shrinking visual; the outer hero clips the edges. */
  transform: scale(1.14);
}

.hero__stage {
  position: absolute;
  left: 50%;
  top: var(--bg-align-y);
  width: calc(max(100cqw, 100cqh * var(--bg-ratio-num)) + 4px);
  aspect-ratio: var(--bg-ratio);
  translate: -50% calc(var(--bg-align-y) * -1);
}

.hero__stage img {
  display: block;
  width: 100%;
  height: 100%;
}

.hero__screen {
  position: absolute;
  left: var(--screen-left);
  top: var(--screen-top);
  width: var(--screen-width);
  height: var(--screen-height);
  object-fit: cover;
  pointer-events: none;
}

.hero__sound {
  --sound-size: 40px;
  --sound-inset: 12px;
  position: absolute;
  left: calc(var(--screen-left) + var(--screen-width));
  top: calc(var(--screen-top) + var(--screen-height));
  translate: calc(-100% - var(--sound-inset)) calc(-100% - var(--sound-inset));
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--sound-size);
  height: var(--sound-size);
  border: 1px solid var(--black);
  border-radius: 8px;
  background: var(--lime-400);
  box-shadow: var(--shadow-green);
  color: var(--black);
  cursor: var(--cursor-pointer);
  transition:
    background-color 0.3s var(--transition-timing),
    color 0.3s var(--transition-timing);
}

.hero__sound svg {
  display: block;
  width: 50%;
  height: 50%;
}

.hero__sound:hover,
.hero__sound:focus-visible {
  background: var(--black);
  color: var(--lime-400);
}

.hero__sound:focus-visible {
  outline: 2px solid var(--lime-400);
  outline-offset: 2px;
}

.hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
  color: var(--white);
  height: 100%;
  /* Let clicks reach the monitor's sound button behind the empty area. */
  pointer-events: none;
}

.hero__text,
.hero__actions {
  pointer-events: auto;
}

.hero__case {
  position: absolute;
  right: var(--container-gutter);
  bottom: var(--container-padding);
  z-index: 2;
  width: 348px;
  height: 118px;
}

.case-swap-leave-active {
  transition:
    opacity 0.24s var(--transition-timing),
    transform 0.24s var(--transition-timing);
}

.case-swap-enter-active {
  transition:
    opacity 0.32s var(--transition-timing),
    transform 0.32s var(--transition-timing);
}

.case-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.case-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.hero__title,
.hero__title .highlight {
  background-size: 300% 100%;
  background-position: 100% 0;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__title--play,
.hero__title--play .highlight {
  animation: lightSweepReveal 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.hero__title {
  background-image: linear-gradient(
    94deg,
    #fff 0%,
    #fff 40%,
    rgba(255, 255, 255, 0.8) 45%,
    var(--lime-400) 48%,
    rgba(255, 255, 255, 0.3) 52%,
    transparent 55%,
    transparent 100%
  );
}

.hero__title .highlight {
  background-image: linear-gradient(
    94deg,
    var(--lime-400) 0%,
    var(--lime-400) 40%,
    #fff 45%,
    #fff 48%,
    rgba(255, 255, 255, 0.5) 52%,
    transparent 55%,
    transparent 100%
  );
}

@keyframes lightSweepReveal {
  0% {
    background-position: 100% 0;
    filter: drop-shadow(0 0 12px var(--lime-400));
  }
  100% {
    background-position: 0% 0;
  }
}

.hero__title-wrap {
  position: relative;
  width: max-content;
  max-width: 100%;
  margin-inline: auto;
}

.hero__subtitle {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  line-height: normal;
  margin-top: 20px;
}
.hero__actions {
  display: none;
}

@media (1200px <= width < 1680px) {
  .hero {
    --hero-laptop: tan(atan2(clamp(0px, (1680px - 100vw) / 240, 1px), 1px));
    --heading-h1: calc(4vw + 8px * var(--hero-laptop));
  }

  .hero__subtitle {
    font-size: calc(18px - 3px * var(--hero-laptop));
  }

  .hero__stage {
    top: calc(var(--bg-align-y) + 24px * var(--hero-laptop));
  }

  .hero__case {
    right: calc(30px - 6px * var(--hero-laptop));
    bottom: calc(30px - 6px * var(--hero-laptop));
  }
}

@media (width < 1200px) {
  .hero__visual {
    padding-bottom: 32px;
  }
  .hero__actions {
    display: block;
    margin-top: auto;
  }

  .hero__case {
    display: none;
  }
}
@media (width >= 768px) {
  .hero__text {
    --stage-h: max(100vw / var(--bg-ratio-num), 100dvh);
    --screen-y: calc(
      (100dvh - var(--stage-h)) / 2 + var(--stage-h) * var(--screen-top-ratio)
    );
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: calc(var(--screen-y) - var(--hero-offset));
  }
}

@media (width < 768px) {
  .hero {
    --bg-ratio: 900 / 1948;
    --bg-ratio-num: 0.462;
    --bg-align-y: 38%;
    --screen-left: 18.667%;
    --screen-top: 55.544%;
    --screen-width: 62.889%;
    --screen-height: 17.659%;
    min-height: 100svh;
  }

  .hero__background {
    transform: none;
  }

  .hero__stage {
    /* Keep the monitor's foot above the CTA, even with Safari's bars open. */
    top: calc(100% - 100px - env(safe-area-inset-bottom, 0px));
    translate: -50% -82.5%;
  }

  .hero__visual {
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }

  .hero__sound {
    --sound-size: 32px;
    --sound-inset: 8px;
  }

  .hero__visual::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 18%;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5));
    pointer-events: none;
  }

  .hero .container {
    container-type: inline-size;
    padding-inline: 8px;
  }
  .hero__content {
    max-width: 360px;
  }
  .hero__text {
    margin-top: 0;
  }
  .hero__title {
    font-size: clamp(32px, 10.25vw, 42px);
    font-weight: 600;
    line-height: 1.03;
  }

  .hero__subtitle {
    max-width: 330px;
    margin: 12px auto 0;
    font-size: 14px;
    line-height: 1.35;
  }

  .hero__actions {
    display: flex;
    justify-content: center;
  }

  .hero__cta {
    justify-content: space-between;
    flex: none;
    width: min(410px, 100cqw);
    max-width: none;
  }
}

@media (width < 768px) and (height < 640px) {
  .hero { --hero-offset: 72px; }
  .hero__subtitle { margin-top: 10px; font-size: 13px; }
}

@media (prefers-reduced-motion: reduce) {
  .case-swap-leave-active,
  .case-swap-enter-active,
  .hero__sound {
    transition: none;
  }
}
</style>
