<template>
  <footer
    id="footer"
    ref="footerRef"
    class="footer"
    :class="{ 'footer--bar-only': barOnly }"
  >
    <template v-if="!barOnly">
      <img
        class="footer__scene"
        decoding="async"
        :src="active.scene"
        alt=""
        @load="onSceneLoad"
      />
      <img
        ref="cloudRef"
        class="footer__cloud"
        :src="cloudImg"
        alt="Northline"
        loading="lazy"
        decoding="async"
      />
      <img
        class="footer__moon"
        :src="moonImg"
        alt=""
        loading="lazy"
        decoding="async"
      />

      <div class="footer__spots">
        <button
          v-for="spot in active.spots"
          :key="spot.key"
          type="button"
          class="footer__spot"
          :class="{
            'footer__spot--tip-below': spot.below,
            'is-story-active': shownSpot === spot.key,
            'is-mail-ready': spot.mail && mailReady && shownSpot === spot.key,
          }"
          :style="spotStyle(spot)"
          :aria-label="spot.label"
          @mouseenter="enterSpot(spot)"
          @mouseleave="leaveSpot"
          @focus="enterSpot(spot)"
          @blur="leaveSpot"
          @click="onSpotClick(spot)"
        >
          <span class="footer__spot-glow" aria-hidden="true">
            <img
              :src="active.elements"
              alt=""
              :style="glowStyle(spot)"
              loading="lazy"
              decoding="async"
            />
          </span>

          <Transition name="footer-tip">
          <span
            v-if="spot.message && shownSpot === spot.key"
            class="footer__tip"
            :class="{ 'footer__tip--mail': spot.mail }"
            :style="tipStyle(spot)"
          >
            <span class="footer__tip-text">
              <span v-for="line in spot.message" :key="line">{{ line }}</span>
            </span>
            <img
              v-if="spot.mail"
              class="footer__tip-icon"
              :src="mailIcon"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </span>
          </Transition>
        </button>
      </div>
    </template>

    <div class="footer__bar">
      <div class="footer__contact">
        <span>073-234-6541</span>
        <a href="mailto:hello@nrtline.com">hello@nrtline.com</a>
      </div>
      <p class="footer__copy">© 2026 Northline Studio. All rights reserved.</p>
      <div class="footer__legal">
        <RouterLink :to="{ name: 'terms' }">Terms of Use</RouterLink>
        <RouterLink :to="{ name: 'privacy' }">Privacy Policy</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { useContactModal } from '@/composables/useContactModal';
import { below, useMediaQuery } from '@/composables/useBreakpoints';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { WIDE_SCENE, NARROW_SCENE } from './scene.data.js';

import cloudImg from '@/assets/images/footer/northline-cloud.webp';
import moonImg from '@/assets/images/footer/moon.webp';
import mailIcon from '@/assets/images/footer/mail-icon.webp';

const props = defineProps({
  barOnly: { type: Boolean, default: false },
});

const cloudRef = ref(null);
const activeSpot = ref(null);
const storySpot = ref(null);
const mailReady = ref(false);
const shownSpot = computed(() => activeSpot.value ?? storySpot.value);
let story;
let atFooterEnd = false;
// Only the narrative captions participate; the scenic asides stay hover-only.
const storyOrder = ['main-cabin', 'green-house', 'left-cabin', 'right-cabin', 'campfire', 'mailbox'];

function enterSpot(spot) {
  activeSpot.value = spot.key;
  story?.pause();
}

function leaveSpot() {
  activeSpot.value = null;
  if (atFooterEnd) story?.resume();
}

function resetStory() {
  story?.kill();
  story = null;
  storySpot.value = null;
  mailReady.value = false;
}

function startStory() {
  resetStory();
  if (prefersReducedMotion()) {
    storySpot.value = 'mailbox';
    return;
  }
  story = gsap.timeline({ paused: true });
  storyOrder.forEach((key) => {
    const spot = active.value.spots.find((item) => item.key === key);
    if (!spot?.message) return;
    story.call(() => {
      storySpot.value = key;
      mailReady.value = Boolean(spot.mail);
    });
    if (!spot.mail) {
      // Allow time to read each complete caption, then softly hand off the light.
      const words = spot.message.join(' ').split(/\s+/).length;
      story.to({}, { duration: Math.max(2.8, words * 0.25 + 0.8) });
    }
  });
  if (!activeSpot.value) story.play();
}

const isNarrow = useMediaQuery(below('mobile'));
const active = computed(() => (isNarrow.value ? NARROW_SCENE : WIDE_SCENE));

watch(isNarrow, () => {
  activeSpot.value = null;
  if (atFooterEnd) startStory();
});

const spotStyle = (s) => {
  const { canvas, pad } = active.value;
  return {
    left: `calc(${s.x - pad} * var(--u-spot))`,
    bottom: `calc(${canvas.h - s.y - s.h - pad} * var(--u-spot))`,
    width: `calc(${s.w + pad * 2} * var(--u-spot))`,
    height: `calc(${s.h + pad * 2} * var(--u-spot))`,
  };
};

const glowStyle = (s) => {
  const { canvas, pad } = active.value;
  const w = s.w + pad * 2;
  const h = s.h + pad * 2;
  return {
    width: `${((canvas.w / w) * 100).toFixed(4)}%`,
    left: `${((-(s.x - pad) / w) * 100).toFixed(4)}%`,
    bottom: `${((-(canvas.h - s.y - s.h - pad) / h) * 100).toFixed(4)}%`,
  };
};

const tipStyle = (s) => {
  if (s.key === 'main-cabin') return { '--tip-a': '50%', '--tip-gap': '-4px' };
  const { canvas } = active.value;
  const cx = (s.x + s.w / 2) / canvas.w;
  if (cx < 0.3) return { '--tip-a': '15%' };
  if (cx > 0.7) return { '--tip-a': '85%' };
  return {};
};

const { open: openContactModal } = useContactModal();

function onSpotClick(spot) {
  if (spot.opensForm) {
    openContactModal();
    activeSpot.value = null;
    resetStory();
  }
}

function onSceneLoad() {
  ScrollTrigger.refresh();
}

const footerRef = useScrollScene((root) => {
  if (props.barOnly) return;
  const reduced = prefersReducedMotion();

  if (!reduced && cloudRef.value) {
    gsap.to(cloudRef.value, {
      yPercent: 9,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  const syncStory = () => {
    const atEnd = root.getBoundingClientRect().bottom <= window.innerHeight + 8;
    if (atEnd === atFooterEnd) return;
    atFooterEnd = atEnd;
    if (atEnd) startStory();
    else resetStory();
  };
  ScrollTrigger.create({
    trigger: root,
    start: 'bottom bottom+=8',
    onEnter: syncStory,
    onLeaveBack: syncStory,
    onRefresh: syncStory,
  });
  // Also follow the physical page edge after responsive layouts change the
  // document height; a refreshed trigger need not cross its start again.
  window.addEventListener('scroll', syncStory, { passive: true });

  return () => {
    window.removeEventListener('scroll', syncStory);
    atFooterEnd = false;
    resetStory();
  };
});
</script>

<style scoped>
.footer {
  position: relative;
  container-type: inline-size;
  aspect-ratio: 1920 / 1799;
  overflow: hidden;
  color: var(--white);
  background: linear-gradient(180deg, var(--blue-100) 0%, #82cbf8 60%);
  --u-spot: calc(100cqw / 1254);
  --u: calc(100cqw / 1920);
}

.footer__scene {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 100cqw;
  height: auto;
}

.footer__spot-glow img {
  position: absolute;
  height: auto;
  max-width: none;
}

.footer__cloud {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: calc(19 * var(--u));
  width: calc(1426 * var(--u));
  transform: translateX(-50%);
  will-change: transform;
  pointer-events: none;
}

.footer__moon {
  position: absolute;
  z-index: 2;
  left: 19.11%;
  top: 6.61%;
  width: 3.55%;
  pointer-events: none;
}

.footer__spots {
  position: absolute;
  inset: 0;
  z-index: 4;
}

.footer__spot {
  position: absolute;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: var(--cursor-pointer);
}

.footer__spot-glow {
  --glow-peak: 0.75;

  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.32s var(--transition-timing);
  pointer-events: none;
}

.footer__spot-glow img {
  filter: drop-shadow(0 0 calc(10 * var(--u)) rgba(255, 255, 255, 0.76))
    drop-shadow(
      0 calc(-5 * var(--u)) calc(12 * var(--u)) rgba(255, 255, 255, 0.56)
    );
}

.footer__spot:hover .footer__spot-glow,
.footer__spot:focus-visible .footer__spot-glow,
.footer__spot.is-story-active .footer__spot-glow {
  opacity: var(--glow-peak);
}

.footer__spot:focus-visible {
  outline: 2px solid var(--lime-400);
  outline-offset: 2px;
}

.footer__spot.is-mail-ready .footer__spot-glow {
  animation: footer-mail-call 2.2s ease-in-out 4;
}

@keyframes footer-mail-call {
  0%, 100% { opacity: var(--glow-peak); }
  50% { opacity: 0.15; }
}

/* Match the cards' upward fade/blur exit and soft rising entrance.
   Both run together: there is no empty beat between the captions. */
.footer-tip-enter-active {
  transition: opacity 0.52s cubic-bezier(0.215, 0.61, 0.355, 1),
    translate 0.52s cubic-bezier(0.215, 0.61, 0.355, 1), filter 0.52s ease-out;
}
.footer-tip-leave-active {
  transition: opacity 0.4s ease-in, translate 0.4s ease-in, filter 0.4s ease-out;
}
.footer-tip-enter-from {
  opacity: 0;
  translate: 0 16px;
  filter: blur(4px);
}
.footer-tip-leave-to {
  opacity: 0;
  translate: 0 -14px;
  filter: blur(8px);
}

.footer__tip {
  position: absolute;
  left: 50%;
  bottom: 100%;
  z-index: 2;
  transform: translateX(calc(-1 * var(--tip-a, 50%)));
  margin-bottom: var(--tip-gap, 6px);
  display: flex;
  align-items: center;
  gap: max(6px, calc(8 * var(--u)));
  width: max-content;
  max-width: min(440px, calc(100vw - 32px));
  padding: max(6px, calc(8 * var(--u))) max(9px, calc(12 * var(--u)));
  border: 1px solid var(--black);
  border-radius: max(6px, calc(8 * var(--u)));
  color: var(--black-900);
  background: var(--white);
  box-shadow: 3px 3px 0 0 rgba(10, 10, 10, 0.25);
  font-family: var(--font-mono);
  font-size: max(11px, calc(12 * var(--u)));
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  pointer-events: none;
}

.footer__tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: var(--tip-a, 50%);
  width: max(8px, calc(10 * var(--u)));
  height: max(8px, calc(10 * var(--u)));
  transform: translate(-50%, -55%) rotate(45deg);
  border: 1px solid var(--black);
  border-width: 0 1px 1px 0;
  background: inherit;
}

.footer__tip-text span {
  display: block;
}

.footer__tip-icon {
  flex-shrink: 0;
  width: max(18px, calc(25 * var(--u)));
  height: auto;
}

.footer__bar {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: var(--viewport-edge);
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: calc(20 * var(--u));
  width: calc(100% - 2 * var(--viewport-edge));
  font-family: var(--font-mono);
  font-size: max(11px, calc(16 * var(--u)));
  font-weight: 500;
  line-height: 1.6;
}

.footer__contact,
.footer__legal {
  display: flex;
  flex-direction: column;
  gap: calc(8 * var(--u));
}

.footer__legal {
  align-items: flex-end;
  text-align: right;
}

.footer__legal a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.footer__bar a {
  color: inherit;
}

.footer__copy {
  margin: 0;
}

.footer--bar-only {
  aspect-ratio: auto;
  overflow: visible;
  background: var(--white);
  color: var(--black-900);
  border-top: 1px solid #e2e2e2;
}

.footer--bar-only .footer__bar {
  position: static;
  transform: none;
  width: 100%;
  max-width: var(--container-width);
  margin-inline: auto;
  padding: 32px var(--container-padding);
  gap: 20px;
  font-size: 14px;
}

@media (width < 1024px) {
  .footer--bar-only .footer__bar {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px var(--container-padding-mobile);
    text-align: center;
  }

  .footer--bar-only .footer__contact,
  .footer--bar-only .footer__legal {
    align-items: center;
    text-align: center;
  }
}

@media (width < 768px) {
  .footer:not(.footer--bar-only) {
    aspect-ratio: 390 / 965;
    --u-spot: calc(100cqw / 941);
    --u: calc(100cqw / 390);
  }

  .footer:not(.footer--bar-only)::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    z-index: 3;
    height: calc(222 * var(--u));
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(calc(7 * var(--u)));
    mask: linear-gradient(rgba(0, 0, 0, 0), rgb(0, 0, 0));
    -webkit-mask: linear-gradient(rgba(0, 0, 0, 0), rgb(0, 0, 0));
    pointer-events: none;
  }

  .footer__cloud {
    top: calc(131 * var(--u));
    width: calc(358 * var(--u));
  }

  .footer__moon {
    left: calc(75.845 * var(--u));
    top: calc(52 * var(--u));
    width: calc(18.236 * var(--u));
  }

  .footer__spot-glow img {
    filter: drop-shadow(0 0 calc(2 * var(--u)) rgba(255, 255, 255, 0.76))
      drop-shadow(
        0 calc(-1 * var(--u)) calc(2.5 * var(--u)) rgba(255, 255, 255, 0.56)
      );
  }

  .footer:not(.footer--bar-only) .footer__bar {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: start;
    bottom: var(--viewport-edge);
    row-gap: 32px;
    width: calc(100% - 2 * var(--viewport-edge));
    font-size: 12px;
  }

  .footer:not(.footer--bar-only) .footer__contact,
  .footer:not(.footer--bar-only) .footer__legal {
    grid-row: 1;
    gap: 6px;
  }

  .footer:not(.footer--bar-only) .footer__legal {
    grid-column: 2;
  }

  .footer:not(.footer--bar-only) .footer__copy {
    grid-row: 2;
    grid-column: 1 / -1;
    justify-self: center;
    max-width: 180px;
    line-height: 1.3;
    text-align: center;
  }

  .footer__tip {
    gap: 7px;
    max-width: min(340px, calc(100vw - 32px));
    padding: 8px 12px;
    border-radius: 8px;
    background: #f7f7f7;
    box-shadow: none;
    font-size: 12px;
    line-height: 1.5;
  }

  .footer__tip--mail {
    padding-right: 7px;
    box-shadow: 0 0 0 3px rgba(196, 239, 55, 0.5);
  }

  .footer__tip-icon {
    width: 25px;
  }

  .footer__spot:active .footer__tip--mail {
    box-shadow: 0 0 0 5px rgba(196, 239, 55, 0.5);
  }

  .footer__tip::after {
    width: 10.2px;
    height: 10.2px;
  }

  .footer__spot--tip-below .footer__tip {
    top: 100%;
    bottom: auto;
    margin-top: 6px;
    margin-bottom: 0;
  }

  .footer__spot--tip-below .footer__tip::after {
    top: auto;
    bottom: 100%;
    transform: translate(-50%, 55%) rotate(45deg);
    border-width: 1px 0 0 1px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer__spot-glow {
    transition: none;
  }
  .footer-tip-enter-active,
  .footer-tip-leave-active {
    transition: none;
  }
  .footer-tip-enter-from,
  .footer-tip-leave-to {
    translate: none;
    filter: none;
  }
  .footer__spot.is-mail-ready .footer__spot-glow {
    animation: none;
  }
}
</style>
