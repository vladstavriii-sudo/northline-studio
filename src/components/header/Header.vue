<template>
  <header
    ref="headerRef"
    class="header"
    :class="{ 'header--hero': hero, 'header--hero-covered': heroCovered, 'header--scrolled': isScrolled, 'header--pixel': isPixelChrome, 'header--theme-swap': pixelExitPending }"
  >
    <div class="container">
      <div class="header__wrapper">
        <RouterLink
          :to="{ name: 'home', hash: '#home' }"
          class="header__logo"
          @click="closeMenu"
        >
          <img
            v-if="isPixelChrome"
            class="header__logo-pixel"
            :src="pixelLogo"
            alt=""
          />
          <AppLogo v-else :base="isScrolled ? 'var(--blue-100)' : 'white'" />
          <span class="header__logo-text">
            Northline <span class="header__logo-studio">studio</span>
          </span>
        </RouterLink>
        <nav class="header__nav" :class="{ hidden: !isDesktop }">
          <ul class="header__nav-list">
            <li
              v-for="item in navList"
              :key="item.hash"
              class="header__nav-item"
            >
              <RouterLink
                :to="{ name: 'home', hash: item.hash }"
                class="header__nav-link"
                @click="closeMenu"
                @mouseenter="activeNav = item.label"
                @mouseleave="activeNav = ''"
                @focus="activeNav = item.label"
                @blur="activeNav = ''"
              >
                <PixelNavText v-if="isPixelChrome" :text="item.label" :active="activeNav === item.label" />
                <template v-else>{{ item.label }}</template>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="header__actions">
          <RouterLink
            v-if="projectExit"
            class="header__project-exit"
            :to="{ name: 'home', hash: '#archive' }"
            aria-label="Exit project"
            title="Exit project"
          >
            <svg class="header__exit-frame" viewBox="0 0 50 46" fill="none" aria-hidden="true" preserveAspectRatio="none" shape-rendering="crispEdges">
              <path d="M8 4H46V8H50V42H46V46H8V42H4V8H8V4Z" fill="white" />
              <g class="header__exit-front">
                <path d="M4 0H42V4H46V38H42V42H4V38H0V4H4V0Z" fill="white" />
                <path class="header__exit-face" d="M6 2H40V6H44V36H40V40H6V36H2V6H6V2Z" />
              </g>
            </svg>
            <svg class="header__exit-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" shape-rendering="crispEdges">
              <path d="M13 5H5V27H13M11 5H17V12M17 21V27H11" stroke="currentColor" stroke-width="2" />
              <path class="header__exit-arrow" d="M12 16H28M22 10L28 16L22 22" stroke="currentColor" stroke-width="2" />
            </svg>
          </RouterLink>
          <button
            v-if="isPixelChrome"
            type="button"
            class="header__pixel-cta"
            :class="{ hidden: !isDesktop }"
            @click="openContactModal"
          >
            <span>Start a Project</span>
          </button>
          <AppLink
            v-else
            has-icon
            :classes="!isDesktop ? 'hidden' : ''"
            @click="openContactModal"
            >Start a Project</AppLink
          >
          <div
            class="header__actions-wrapper"
            :class="{ 'is-open': isMenuOpen }"
          >
            <AppCard
              as="nav"
              class="header__nav-mobile"
              :class="{ hidden: isDesktop }"
              :plate="isPixelChrome ? '' : 'var(--lime-400)'"
              plate-side="bottom-left"
              :plate-size="8"
            >
              <span class="header__nav-title-mobile">Menu</span>
              <ul class="header__nav-list-mobile">
                <li
                  v-for="item in navList"
                  :key="item.hash"
                  class="header__nav-item-mobile"
                >
                  <RouterLink
                    :to="{ name: 'home', hash: item.hash }"
                    class="header__nav-link-mobile"
                    @click="closeMenu"
                    @mouseenter="activeNav = item.label"
                    @mouseleave="activeNav = ''"
                    @focus="activeNav = item.label"
                    @blur="activeNav = ''"
                  >
                    <PixelNavText v-if="isPixelChrome" :text="item.label" :active="activeNav === item.label" />
                    <template v-else>{{ item.label }}</template>
                  </RouterLink>
                </li>
              </ul>
            </AppCard>
            <button
              class="header__burger"
              :class="{ hidden: isDesktop }"
              type="button"
              :aria-expanded="isMenuOpen"
              aria-label="Toggle navigation"
              @click="toggleMenu"
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useBreakpoints } from '@/composables/useBreakpoints';
import AppLink from '@/components/ui/AppLink.vue';
import AppLogo from '@/components/ui/AppLogo.vue';
import AppCard from '@/components/ui/AppCard.vue';
import PixelNavText from './PixelNavText.vue';
import { RouterLink } from 'vue-router';
import { usePixelChrome } from '@/composables/usePixelChrome';
import pixelLogo from '@/assets/icons/archive/logo-pixel.svg';
import { useContactModal } from '@/composables/useContactModal';
import { useHeaderLock } from '@/composables/useHeaderLock';

const { open: openContactModal } = useContactModal();
const props = defineProps({ pinned: Boolean, projectExit: Boolean, hero: Boolean });
const activeNav = ref('');

const { isHeaderLocked } = useHeaderLock();

const navList = [
  { label: 'About', hash: '#brand' },
  { label: 'Services', hash: '#services' },
  { label: 'Projects', hash: '#archive' },
  { label: 'Process', hash: '#process' },
  { label: 'Contact', hash: '#cta' },
];

const { isPixelChrome: requestedPixelChrome } = usePixelChrome();
// Keep the archive skin while its header slides out. Swapping the contents
// and background during that movement exposes a flash of the light header.
const isPixelChrome = ref(requestedPixelChrome.value);
const pixelExitPending = ref(false);
let skinFrame = 0;
const { isDesktop } = useBreakpoints();

const headerRef = ref(null);
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const heroCovered = ref(false);
let heroSection = null;

let mainTrigger = null;
let styleTrigger = null;
let showAnim = null;

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
const closeOnScroll = () => closeMenu();

watch(isMenuOpen, (open) => {
  if (open) window.addEventListener('scroll', closeOnScroll, { passive: true });
  else window.removeEventListener('scroll', closeOnScroll);
});

function syncVisibility(direction = mainTrigger?.direction ?? -1) {
  if (!showAnim) return;
  heroCovered.value = !!heroSection && heroSection.getBoundingClientRect().bottom > 80;
  if (pixelExitPending.value) {
    showAnim.reverse();
  } else if (props.pinned || isMenuOpen.value || requestedPixelChrome.value) {
    showAnim.play();
  } else if (isHeaderLocked.value) {
    showAnim.reverse();
  } else if (
    direction === -1 ||
    window.scrollY <= 8 ||
    ScrollTrigger.maxScroll(window) <= 0
  ) {
    showAnim.play();
  } else {
    showAnim.reverse();
  }
}

function finishPixelExit() {
  if (!pixelExitPending.value || requestedPixelChrome.value) return;
  isPixelChrome.value = false;
  // Commit the new skin offscreen without a CSS background transition.
  skinFrame = requestAnimationFrame(() => {
    skinFrame = requestAnimationFrame(() => {
      pixelExitPending.value = false;
      syncVisibility();
    });
  });
}

watch(isHeaderLocked, () => syncVisibility());
watch(requestedPixelChrome, (pixel) => {
  if (props.hero) return;
  cancelAnimationFrame(skinFrame);
  if (pixel) {
    pixelExitPending.value = false;
    isPixelChrome.value = true;
    syncVisibility();
  } else if (isPixelChrome.value && showAnim) {
    pixelExitPending.value = true;
    syncVisibility();
    if (showAnim.progress() === 0) finishPixelExit();
  } else {
    isPixelChrome.value = false;
    syncVisibility();
  }
});

onMounted(() => {
  if (props.hero) return;
  showAnim = gsap
    .from(headerRef.value, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: 'power2.out',
      onReverseComplete: finishPixelExit,
    })
    .progress(1);

  heroSection =
    document.querySelector('#home') || document.querySelector('.hero');
  heroCovered.value = !!heroSection && heroSection.getBoundingClientRect().bottom > 80;
  if (!heroSection) isScrolled.value = true;
  if (heroSection) {
    styleTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: 'bottom 80px',
      end: 'max',
      onToggle: (self) => { isScrolled.value = self.isActive; },
      onRefresh: (self) => { isScrolled.value = self.isActive; },
    });
  }

  // Track direction from the first scroll, before the header changes theme.
  mainTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: 'top -8px',
    end: 'max',
    onUpdate: (self) => {
      syncVisibility(self.direction);
    },
  });
});

onUnmounted(() => {
  cancelAnimationFrame(skinFrame);
  window.removeEventListener('scroll', closeOnScroll);
  mainTrigger?.kill();
  styleTrigger?.kill();
  showAnim?.kill();
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding-top: 26px;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease,
    padding 0.3s ease,
    color 0.3s ease;
}
.header--hero { position: absolute; }
.header--hero-covered { visibility: hidden; pointer-events: none; }

.header--scrolled {
  padding-block: var(--header-pad);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.header--theme-swap {
  transition: none;
}

.header--scrolled .header__logo,
.header--scrolled .header__logo-studio,
.header--scrolled .header__nav-list {
  color: var(--blue-100);
}

.header--scrolled .header__nav-link {
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 90%,
    var(--blue-100) 90%,
    var(--blue-100) 100%
  );
}

.header--scrolled .header__nav-link:hover {
  color: var(--blue-100);
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 90%,
    var(--blue-100) 90%,
    var(--blue-100) 100%
  );
}

.header__wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
}
.header__logo { grid-column: 1; justify-self: start; }
.header__nav { grid-column: 2; justify-self: center; }
.header__actions { grid-column: 3; justify-self: end; display: flex; align-items: center; gap: 12px; }
.header__project-exit {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: 50px;
  height: 47.2px;
  border: 0;
  color: var(--white);
  transition: color .2s ease;
}
.header__exit-frame { position: absolute; inset: 0; width: 100%; height: 100%; }
.header__exit-front { transition: transform .22s ease; }
.header__exit-face { fill: var(--archive-screen); transition: fill .2s ease; }
.header__exit-icon { position: relative; width: 30px; height: 30px; translate: -2px -2px; transition: translate .22s ease; }
.header__exit-arrow { transition: transform .22s ease; }
.header__project-exit:hover, .header__project-exit:focus-visible {
  color: var(--pixel-orange);
}
.header__project-exit:hover .header__exit-face,
.header__project-exit:focus-visible .header__exit-face { fill: var(--white); }
.header__project-exit:is(:hover, :focus-visible) .header__exit-front { transform: translate(4px, 4px); }
.header__project-exit:is(:hover, :focus-visible) .header__exit-icon { translate: 2px 2px; }
.header__project-exit:is(:hover, :focus-visible) .header__exit-arrow { transform: translateX(2px); }
.header__project-exit:active .header__exit-icon { scale: .94; }
.header__project-exit:focus-visible { outline: 2px solid var(--pixel-orange); outline-offset: 4px; }
@media (width < 768px) {
  .header__project-exit { width: 40px; height: 40px; }
}
.header__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 32px;
  font-weight: 700;
  color: var(--white);
}
.header__logo-text {
  display: flex;
  gap: 2px;
}
.header__logo-studio {
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-logo);
  font-size: 10px;
  font-weight: 600;
  line-height: normal;
}
.header__nav-list {
  display: flex;
  align-items: center;
  gap: 40px;
  color: var(--blue-500);
  font-family: var(--font-mono);
  line-height: normal;
  text-transform: capitalize;
}

.header__nav-link {
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 90%,
    var(--blue-500) 90%,
    var(--blue-500) 100%
  );

  background-size: 0% 100%;
  background-repeat: no-repeat;
  background-position: right;
  transition:
    background-size 0.2s ease-in-out,
    color 0.2s ease-in-out;
}

.header__nav-link:hover {
  color: var(--white);
  background-size: 100% 100%;
  background-position: left;
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 90%,
    var(--white) 90%,
    var(--white) 100%
  );
}

@media (width < 1200px) {
  .header__actions-wrapper.is-open .header__nav-mobile {
    opacity: 1;
    visibility: visible;
    transform: translate(-80%) scale(1) rotate(0.001deg);
  }

  .header__actions-wrapper.is-open .header__burger {
    translate: -10px 18px;
  }

  .header__actions-wrapper.is-open .header__burger span:nth-child(1) {
    rotate: 45deg;
    translate: 0px 4px;
  }

  .header__actions-wrapper.is-open .header__burger span:nth-child(2) {
    rotate: -45deg;
    translate: 0px -4px;
  }

  .header__nav-mobile {
    --card-bg: #f4f3f3;

    opacity: 0;
    min-width: 268px;
    visibility: hidden;
    display: flex;
    flex-direction: column;
    gap: 26px;
    position: absolute;
    transition:
      all 0.5s var(--transition-timing),
      transform 0.7s var(--transition-timing);
    transform: translate(-40%, -42%) scale(0.15) rotate(0.001deg);
  }
  .header__nav-list-mobile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 36px;
    text-transform: capitalize;
  }
  .header__nav-link-mobile {
    position: relative;
    width: 100%;
    display: block;
  }

  .header__nav-link-mobile::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    border: 3px solid var(--black);
    top: 50%;
    right: 14px;
    z-index: -1;
    opacity: 0;
    scale: 0;
    transition: all 0.7s var(--transition-timing);
  }

  .header__nav-link-mobile:hover::before {
    opacity: 1;
    scale: 1;
  }
  .header__burger {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 8px;
    background: var(--lime-400);
    box-shadow: var(--shadow-green);
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    border: 1px solid var(--black);
    cursor: var(--cursor-pointer);
    transition: translate 0.7s var(--transition-timing);
  }

  .header__burger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--black);
    border-radius: 4px;
    transition: all 0.5s var(--transition-timing);
  }

  .header__burger:hover span:nth-child(1) {
    translate: 0 8px;
  }

  .header__burger:hover span:nth-child(2) {
    translate: 0 -8px;
  }

  .header__nav-title-mobile {
    font-family: var(--font-mono);
    font-size: 14px;
    text-transform: uppercase;
  }
}

@media (width < 1024px) {
  .header__actions-wrapper.is-open .header__nav-mobile {
    transform: translate(-85%) scale(1) rotate(0.001deg);
  }
  .header__nav-mobile {
    gap: 18px;
  }
  .header__burger {
    width: 34px;
    height: 34px;
  }

  .header__burger span {
    width: 18px;
  }
}

.header--pixel {
  background: var(--archive-screen);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.header--pixel .header__logo,
.header--pixel .header__logo-studio,
.header--pixel .header__nav-list {
  color: var(--white);
}

.header--pixel .header__logo {
  gap: 10px;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 400;
  letter-spacing: -0.02em;
}

.header--pixel .header__logo-studio {
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
}

.header__logo-pixel {
  display: block;
  width: 38px;
  height: 42px;
  object-fit: contain;
}

.header--pixel .header__nav-list {
  gap: 32px;
  font-family: var(--font-display);
  font-size: 26px;
}

.header--pixel .header__nav-link {
  background-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 90%,
    var(--white) 90%,
    var(--white) 100%
  );
  color: rgba(255, 255, 255, 0.9);
}

.header--pixel .header__nav-link:hover {
  color: var(--white);
}

.header__pixel-cta {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 197px;
  height: 47.2px;
  padding: 8px 20px;
  border: 0;
  background: none;
  color: var(--white);
  font-family: var(--font-display);
  font-size: 26px;
  line-height: 1.2;
  text-decoration: none;
  transition: color .22s ease;
}

.header__pixel-cta::before,
.header__pixel-cta::after {
  content: '';
  position: absolute;
  z-index: -1;
  clip-path: polygon(4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px), 0 4px, 4px 4px);
}
.header__pixel-cta::before { inset: 4px 0 0 4px; background: var(--white); }
.header__pixel-cta::after {
  inset: 0 4px 4px 0;
  background: var(--pixel-orange);
  transition: transform .22s ease, background-color .22s ease;
}
.header__pixel-cta span { translate: -2px -2px; transition: translate .22s ease; }

.header__pixel-cta:hover,
.header__pixel-cta:focus-visible {
  color: var(--pixel-orange);
}
.header__pixel-cta:is(:hover, :focus-visible)::after { transform: translate(4px, 4px); background: var(--white); }
.header__pixel-cta:is(:hover, :focus-visible) span { translate: 2px 2px; }
.header__pixel-cta:active span { scale: .98; }

.header__pixel-cta:focus-visible {
  outline: 2px solid var(--white);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .header__pixel-cta, .header__pixel-cta::after, .header__pixel-cta span,
  .header__exit-front, .header__exit-face, .header__exit-icon, .header__exit-arrow {
    transition: none;
  }
}

@media print {
  .header {
    display: none;
  }
}

.header--pixel .header__burger {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: url('@/assets/icons/archive/burger.svg') no-repeat left top / 100%
    100%;
}

.header--pixel .header__burger span {
  display: none;
}

.header--pixel .header__actions-wrapper.is-open .header__burger {
  translate: -13px 10px;
  background-image: url('@/assets/icons/archive/close.svg');
}

.header--pixel .header__nav-mobile {
  --card-bg: url('@/assets/icons/archive/menu-panel.svg') no-repeat left top /
    100% 100%;
  --card-border-width: 0;
  --card-radius: 0;
  --card-pad: 10px 16px 20px 20px;

  width: 272px;
  min-width: 0;
  min-height: 374px;
  gap: 26px;
  color: var(--white);
}

.header--pixel .header__nav-title-mobile,
.header--pixel .header__nav-list-mobile {
  font-family: var(--font-display);
  color: var(--white);
}

.header--pixel .header__nav-title-mobile {
  font-size: 16px;
}

.header--pixel .header__nav-list-mobile {
  gap: 4px;
  font-size: 47px;
  line-height: normal;
}

.header--pixel .header__nav-link-mobile {
  display: flex;
  align-items: center;
  color: var(--white);
}

.header--pixel .header__nav-link-mobile::before {
  right: 13px;
  border-radius: 0;
  border-color: var(--white);
  translate: 0 -50%;
}
</style>
