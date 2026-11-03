<template>
  <section id="cta" ref="sectionRef" class="cta" aria-labelledby="cta-title">
    <div class="container">
      <div ref="stackRef" class="cta__stack" :class="{ 'cta__stack--form': isFormOpen }">
        <div
          class="cta__card"
          :class="{
            'cta__card--form': isFormOpen,
            'cta__card--closing': isFormClosing,
          }"
        >
          <div
            class="cta__inner"
            :data-lenis-prevent="isFormOpen && isNarrow ? '' : undefined"
          >
            <CtaDecor :open="isFormOpen" :narrow="isNarrow" />

            <div ref="introRef" class="cta__intro">
              <h2 id="cta-title" class="cta__title">
                <span class="cta__chunk">Ready to</span><br /><span
                  class="cta__chunk"
                  >make it</span
                >{{ ' ' }}<span class="cta__chunk">real?</span>
              </h2>

              <p class="cta__subtitle">
                <span class="cta__subtitle-line"
                  >Press «Enter» to start a project.</span
                >
                <span class="cta__subtitle-line cta__subtitle-line--form">
                  Describe your project and send it to us
                </span>
              </p>
            </div>

            <div class="cta__keyboard-slot">
              <button
                ref="keyboardRef"
                type="button"
                class="cta__keyboard"
                :tabindex="isFormOpen ? -1 : 0"
                :aria-expanded="isFormOpen"
                aria-controls="cta-form"
                aria-label="Press Enter to start a project"
                @mouseenter="isKeyboardHovered = true"
                @mouseleave="isKeyboardHovered = false"
                @focus="isKeyboardHovered = true"
                @blur="isKeyboardHovered = false"
                @pointerdown="isKeyboardPressed = true"
                @keydown.enter="isKeyboardPressed = true"
                @keydown.space="isKeyboardPressed = true"
                @click="openForm"
              >
                <img
                  v-for="(src, state) in KEYBOARDS"
                  :key="state"
                  class="cta__keyboard-img"
                  :class="{ 'is-active': keyboardState === state }"
                  :src="src"
                  alt=""
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </div>

            <div ref="formSlotRef" class="cta__form-slot">
              <ContactForm
                form-id="cta-form"
                :open="isFormOpen"
                @close="closeForm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useBreakpoints } from '@/composables/useBreakpoints';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { scrollToY } from '@/utils/scroll';

import ContactForm from '@/components/ui/ContactForm.vue';
import CtaDecor from './CtaDecor.vue';

import keyboardDefault from '@/assets/images/cta/keyboard.webp';
import keyboardHover from '@/assets/images/cta/keyboard--hover.webp';
import keyboardPressed from '@/assets/images/cta/keyboard--pressed.webp';

const KEYBOARDS = {
  default: keyboardDefault,
  hover: keyboardHover,
  pressed: keyboardPressed,
};

const { isBelow } = useBreakpoints();
const isNarrow = isBelow('tablet');

const sectionRef = ref(null);
const stackRef = ref(null);
const keyboardRef = ref(null);
const formSlotRef = ref(null);

const isFormOpen = ref(false);
const isFormClosing = ref(false);
const isKeyboardHovered = ref(false);
const isKeyboardPressed = ref(false);

const keyboardState = computed(() => {
  if (isFormOpen.value || isKeyboardPressed.value) return 'pressed';
  return isKeyboardHovered.value ? 'hover' : 'default';
});

const introRef = ref(null);
const INTRO_DURATION = 0.55;

function introParts() {
  return introRef.value
    ? [...introRef.value.querySelectorAll('.cta__chunk, .cta__subtitle-line')]
    : [];
}

async function morphIntro() {
  const parts = introParts();
  const first = parts.map((el) => el.getBoundingClientRect());

  await nextTick();
  if (prefersReducedMotion()) return;

  gsap.killTweensOf(parts);
  gsap.set(parts, { clearProps: 'transform' });

  parts.forEach((el, i) => {
    const last = el.getBoundingClientRect();
    if (!last.height) return;

    gsap.fromTo(
      el,
      {
        x: first[i].left - last.left,
        y: first[i].top - last.top,
        scale: first[i].height / last.height,
        transformOrigin: '0 0',
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: INTRO_DURATION,
        ease: 'ui',
        clearProps: 'transform',
      },
    );
  });
}

watch(isFormOpen, morphIntro, { flush: 'pre' });

function releaseKeyboard() {
  if (!isFormOpen.value) isKeyboardPressed.value = false;
}

const FORM_SCROLL_INSET = 96;
const FORM_SCROLL_DURATION = 0.8;
const HOLD_SCROLL = 0.35;
const EXPAND_SCROLL = 0.9;
const CLOSE_SCROLL = 0.15;
const CLOSE_DURATION = 600;
const OPEN_EPSILON = 0.002;

let closingTimer = 0;

let expand = null;
let openAt = 0;
let revealUntil = 0;

function expandStart() {
  return expand.start + window.innerHeight * HOLD_SCROLL;
}

function formTarget() {
  if (isNarrow.value) return expand.end;
  return Math.min(Math.max(window.scrollY, expand.start + 1), expandStart());
}

function revealForm() {
  const el = formSlotRef.value;
  if (!el) return;

  if (expand) {
    openAt = isNarrow.value ? 1 : 0;
    const top = formTarget();
    if (Math.abs(top - window.scrollY) < 1) return;
    revealUntil = performance.now() + FORM_SCROLL_DURATION * 1000 + 150;
    scrollToY(top, { duration: FORM_SCROLL_DURATION });
    return;
  }

  const rect = el.getBoundingClientRect();
  if (rect.top >= 0 && rect.bottom <= window.innerHeight) return;
  scrollToY(rect.top + window.scrollY - FORM_SCROLL_INSET, {
    duration: FORM_SCROLL_DURATION,
  });
}

function resetComposition() {
  isKeyboardHovered.value = false;
  isKeyboardPressed.value = false;
  if (isFormOpen.value) closeForm({ refocus: false });
}

function onExpandUpdate(self) {
  if (performance.now() < revealUntil) return;

  const holdEnd = HOLD_SCROLL / (HOLD_SCROLL + EXPAND_SCROLL);
  const open = Math.max(0, (self.progress - holdEnd) / (1 - holdEnd));
  const anchor = isFormOpen.value ? openAt : 0;

  if (Math.abs(open - anchor) > OPEN_EPSILON) resetComposition();
}

async function openForm() {
  if (isFormOpen.value) return;
  isFormOpen.value = true;
  await nextTick();
  revealForm();
}

async function closeForm(options) {
  const refocus = options?.refocus !== false;

  if (!isFormOpen.value) return;
  isFormOpen.value = false;
  isFormClosing.value = true;
  clearTimeout(closingTimer);
  closingTimer = setTimeout(() => {
    isFormClosing.value = false;
  }, CLOSE_DURATION);
  isKeyboardHovered.value = false;
  isKeyboardPressed.value = false;
  await nextTick();

  if (refocus) keyboardRef.value?.focus({ preventScroll: true });
}

function handleGlobalEnter(event) {
  if (event.key !== 'Enter' || isFormOpen.value) return;

  const active = document.activeElement;
  if (
    active &&
    active !== document.body &&
    active.closest('input, textarea, select, button, a, [contenteditable]')
  )
    return;

  const rect = stackRef.value?.getBoundingClientRect();
  if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;

  event.preventDefault();
  openForm();
}

function syncViewport() {
  const section = sectionRef.value;
  if (!section) return;
  section.style.setProperty(
    '--cta-vw',
    `${document.documentElement.clientWidth}px`,
  );
  section.style.setProperty('--cta-vh', `${window.innerHeight}px`);
}

let formObserver = null;

function closeOnScrollAway() {
  if (isFormOpen.value) closeForm({ refocus: false });
}

function watchScrollAway() {
  if (!formSlotRef.value) return;
  formObserver = new IntersectionObserver(
    ([entry]) => {
      if (!isFormOpen.value || entry.isIntersecting) return;
      if (entry.boundingClientRect.height <= 0) return;
      if (!entry.rootBounds) return;
      if (entry.boundingClientRect.bottom > entry.rootBounds.top) return;
      closeOnScrollAway();
    },
    { rootMargin: '-50% 0px 0px 0px', threshold: 0 },
  );
  formObserver.observe(formSlotRef.value);
}

let mm;

onMounted(async () => {
  await nextTick();
  window.addEventListener('keydown', handleGlobalEnter);
  window.addEventListener('pointerup', releaseKeyboard);
  window.addEventListener('pointercancel', releaseKeyboard);
  window.addEventListener('keyup', releaseKeyboard);

  syncViewport();
  ScrollTrigger.addEventListener('refreshInit', syncViewport);
  watchScrollAway();

  mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: () => `+=${window.innerHeight * (HOLD_SCROLL + EXPAND_SCROLL)}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: onExpandUpdate,
        onLeaveBack: resetComposition,
      },
    });
    timeline.to({}, { duration: HOLD_SCROLL }).to(sectionRef.value, {
      '--cta-open': 1,
      ease: 'none',
      duration: EXPAND_SCROLL,
    });
    expand = timeline.scrollTrigger;

    ScrollTrigger.create({
      trigger: sectionRef.value,
      start: () => expand.end + window.innerHeight * CLOSE_SCROLL,
      end: 'max',
      onEnter: closeOnScrollAway,
    });

    return () => {
      expand = null;
    };
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalEnter);
  window.removeEventListener('pointerup', releaseKeyboard);
  window.removeEventListener('pointercancel', releaseKeyboard);
  window.removeEventListener('keyup', releaseKeyboard);
  ScrollTrigger.removeEventListener('refreshInit', syncViewport);
  clearTimeout(closingTimer);
  formObserver?.disconnect();
  mm?.revert();
});
</script>

<style scoped>
@property --cta-open {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.cta {
  --cta-open: 0;
  --cta-vw: 100vw;
  --cta-vh: 100vh;

  display: flex;
  align-items: center;
  height: var(--cta-vh);
  overflow-x: clip;
}

.cta > .container {
  width: 100%;
  container-type: inline-size;
}

.cta__stack {
  --cta-ease: var(--transition-timing);
  --cta-duration: 0.55s;
  --cta-t: tan(atan2(clamp(0px, (1920px - 100vw) / 480, 1px), 1px));
  --cta-h: calc(995 - 100 * var(--cta-t));
  --cta-ky: calc(var(--cta-h) / 995);
  --cta-pad: calc(64 - 24 * var(--cta-t));
  --u: min(100cqw / 1440, (var(--cta-vh) - 96px) / (var(--cta-h) + 20));
  --cta-stack-h: calc(var(--cta-h) * var(--u));
  --cta-rise: calc((var(--cta-vh) - var(--cta-stack-h)) / 2);
  --cta-closed-w: 96cqw;
  --cta-card-w: calc(var(--cta-closed-w) + (var(--cta-vw) + 2px - var(--cta-closed-w)) * var(--cta-open));
  --cta-gutter: max(0px, (var(--cta-card-w) - 1440 * var(--u)) / 2);

  position: relative;
  height: var(--cta-stack-h);
}

.cta__card {
  position: absolute;
  top: calc(-1 * var(--cta-rise) * var(--cta-open));
  bottom: calc(-1 * (var(--cta-rise) + 1px) * var(--cta-open));
  left: 50%;
  box-sizing: border-box;
  width: var(--cta-card-w);
  border-radius: calc(20 * var(--u) * (1 - var(--cta-open)));
  --cta-frame: calc(3 * var(--u) * (1 - var(--cta-open)));
  --cta-plate: calc(-20 * var(--u) * (1 - var(--cta-open)));
  --cta-plate-lime: color-mix(
    in srgb,
    var(--lime-400) calc((1 - var(--cta-open)) * 100%),
    transparent
  );
  --cta-plate-line: color-mix(
    in srgb,
    var(--black) calc((1 - var(--cta-open)) * 100%),
    transparent
  );

  box-shadow:
    var(--cta-plate) var(--cta-plate) 0 0 var(--cta-plate-lime),
    var(--cta-plate) var(--cta-plate) 0 var(--cta-frame) var(--cta-plate-line);
  transform: translateX(-50%);
  overflow: hidden;
  color: var(--white);
  background: var(--blue-100);
}

.cta__card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--cta-frame) var(--black);
  pointer-events: none;
}

.cta__inner {
  position: absolute;
  top: calc(var(--cta-rise) * var(--cta-open));
  left: 50%;
  translate: -50% 0;
  width: calc(1440 * var(--u));
  height: calc(var(--cta-h) * var(--u));
}

.cta__intro {
  position: absolute;
  top: calc(var(--cta-pad) * var(--u));
  left: 50%;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc((20 - 8 * var(--cta-t)) * var(--u));
  width: calc(772 * var(--u));
  text-align: center;
}

.cta__title {
  width: 100%;
  font-size: calc(102 * var(--u));
  line-height: 1;
}

.cta__chunk {
  display: inline-block;
  white-space: nowrap;
}

.cta__subtitle {
  position: relative;
  margin: 0;
  width: 100%;
  font-family: var(--font-mono);
  font-size: calc(22 * var(--u));
  font-weight: 500;
  line-height: 1.6;
}

.cta__subtitle-line {
  display: block;
  width: fit-content;
  margin-inline: auto;
  transition: opacity 0.3s ease;
}

.cta__subtitle-line--form {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  opacity: 0;
}

.cta__card--form .cta__subtitle-line {
  margin-inline: 0;
}

.cta__card--form .cta__intro {
  align-items: flex-start;
  gap: calc(12 * var(--u));
  width: calc(552 * var(--u));
  translate: calc(-50% - 380 * var(--u) - var(--cta-gutter)) 0;
  text-align: left;
}

.cta__card--form .cta__title {
  font-size: calc(86 * var(--u));
  line-height: 0.96;
}

.cta__card--form .cta__subtitle {
  font-size: calc(20 * var(--u));
  line-height: 1.4;
}

.cta__card--form .cta__subtitle-line {
  opacity: 0;
}

.cta__card--form .cta__subtitle-line--form {
  opacity: 1;
}

.cta__keyboard-slot {
  display: contents;
}

.cta__keyboard {
  position: absolute;
  top: calc((387 - 76 * var(--cta-t)) * var(--u));
  left: calc(141 * var(--u));
  width: calc(1158 * var(--u));
  height: calc(541 * var(--u));
  padding: 0;
  border: 0;
  background: none;
  cursor: var(--cursor-pointer);
  transition:
    top var(--cta-duration) var(--cta-ease),
    left var(--cta-duration) var(--cta-ease);
}

.cta__keyboard-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 0.25s ease;
  user-select: none;
}

.cta__keyboard-img.is-active {
  opacity: 1;
}

.cta__keyboard:focus-visible {
  outline: calc(3 * var(--u)) solid var(--lime-400);
  outline-offset: calc(4 * var(--u));
  border-radius: calc(12 * var(--u));
}

.cta__card--form .cta__keyboard {
  top: calc((418 * var(--cta-ky) - 20) * var(--u));
  /* Follow the form's left edge, including its protruding lime plate and
     the compact layout inset, rather than allowing the two to overlap. */
  left: calc(-351 * var(--u) - var(--cta-safe-inset, 0px) - var(--cta-gutter) - max(40px, 64 * var(--u)));
  cursor: var(--cursor-default);
  pointer-events: none;
}

.cta__form-slot {
  --u-form: var(--u);
  position: absolute;
  top: calc((var(--cta-h) - 798) / 2 * var(--u));
  left: calc(820 * var(--u));
  width: calc(559 * var(--u));
  height: calc(798 * var(--u));
  opacity: 0;
  translate: calc(60 * var(--u)) 0;
  pointer-events: none;
  transition:
    opacity 0.35s ease,
    translate var(--cta-duration) var(--cta-ease);
}

.cta__card--form .cta__form-slot {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
}

@media (1024px <= width < 1680px) {
  .cta__stack {
    --cta-compact: tan(atan2(clamp(0px, (1680px - 100vw) / 240, 1px), 1px));
    --cta-closed-w: calc(96cqw * (1 - 0.27 * var(--cta-compact)));
    --u: min(100cqw * (1 - 0.1 * var(--cta-compact)) / 1440, (var(--cta-vh) - 96px - 80px * var(--cta-compact)) / (var(--cta-h) + 20));
    --cta-safe-inset: max(0px, (1440 * var(--u) - var(--cta-card-w)) / 2);
  }

  .cta__card {
    /* Center the complete frame, including the offset lime plate. */
    left: calc(50% + 10 * var(--u) * var(--cta-compact) * (1 - var(--cta-open)));
  }

  .cta__card--form .cta__intro {
    translate: calc(-50% - 380 * var(--u) - var(--cta-gutter) + var(--cta-safe-inset)) 0;
  }

  .cta__card--form .cta__form-slot {
    left: calc(820 * var(--u) - var(--cta-safe-inset));
  }
}

@media (1024px <= width < 1440px) {
  .cta__stack--form {
    --cta-closed-w: 86.4cqw;
  }

  .cta__stack--form .cta__card,
  .cta__card--closing {
    transition: width var(--cta-duration) var(--cta-ease);
  }
}

@media (width < 1024px) {
  .cta__stack {
    --cta-closed-w: 100cqw;
    --u: min(min(100cqw, 430px) / 346, (var(--cta-vh) - 48px) / 612);
    --cta-ky: 1;
    --cta-stack-h: calc(600 * var(--u));
    --cta-gutter: 0px;
  }

  .cta__card {
    border-radius: calc(8 * var(--u) * (1 - var(--cta-open)));

    --cta-frame: calc(2 * var(--u) * (1 - var(--cta-open)));
    --cta-plate: calc(-12 * var(--u) * (1 - var(--cta-open)));
  }

  .cta__inner {
    box-sizing: border-box;
    overflow: visible;
    width: calc(346 * var(--u));
    height: calc(600 * var(--u));
  }

  .cta__card--closing .cta__inner {
    transition:
      top var(--cta-duration) var(--cta-ease),
      height var(--cta-duration) var(--cta-ease),
      padding var(--cta-duration) var(--cta-ease);
  }

  .cta__card--form .cta__inner {
    top: 0;
    height: 100%;
    padding: calc(12 * var(--u));
    overflow: hidden auto;
    scrollbar-width: none;
  }

  .cta__card--form .cta__inner::-webkit-scrollbar {
    display: none;
  }

  .cta__intro,
  .cta__card--form .cta__intro {
    top: calc(32 * var(--u));
    left: calc(12 * var(--u));
    align-items: flex-start;
    gap: calc(10 * var(--u));
    width: calc(318 * var(--u));
    translate: none;
    text-align: left;
    transition: opacity 0.3s ease;
  }

  .cta__title,
  .cta__card--form .cta__title {
    font-size: calc(40 * var(--u));
    font-weight: 600;
  }

  .cta__subtitle {
    font-size: calc(14 * var(--u));
  }

  .cta__subtitle-line {
    margin-inline: 0;
  }

  .cta__card--form .cta__intro,
  .cta__card--form .cta__keyboard-slot {
    opacity: 0;
    visibility: hidden;
  }

  .cta__keyboard-slot {
    position: absolute;
    top: calc(196 * var(--u));
    left: 0;
    display: block;
    overflow: visible;
    width: 100%;
    height: calc(362 * var(--u));
    transition: opacity 0.3s ease;
  }

  .cta__keyboard,
  .cta__card--form .cta__keyboard {
    top: 0;
    left: calc(-422 * var(--u));
    width: calc(773 * var(--u));
    height: calc(362 * var(--u));
  }

  .cta__form-slot {
    position: relative;
    top: auto;
    left: auto;
    display: grid;
    grid-template-rows: 0fr;
    overflow: clip;
    overflow-clip-margin: 14px;
    width: 100%;
    height: auto;
    translate: none;
    transition:
      grid-template-rows var(--cta-duration) var(--cta-ease),
      opacity 0.35s ease;
  }

  .cta__form-slot > * {
    min-height: 0;
  }

  .cta__card--form .cta__form-slot {
    grid-template-rows: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta *,
  .cta *::before,
  .cta *::after {
    transition-duration: 0.01ms !important;
  }
}
</style>
