<template>
  <section id="why-us" ref="section" class="why-us" :class="{ 'why-us--static': reducedMotion }">
    <div class="why-us__scene" :style="{ '--scene-scale': sceneScale }">
    <div class="why-us__stage">
      <WhyUsGlobe class="why-us__globe" />

      <div
        v-for="(card, index) in cards"
        :key="card.key"
        class="why-us__slot"
        :class="[
          `why-us__slot--${card.key}`,
          { 'is-active': activeCard === index },
        ]"
      >
        <div class="why-us__magnet">
          <AppCard
            :ref="(el) => setCardRef(el, index)"
            as="article"
            :plate="card.plate"
            :plate-side="card.plateSide"
            class="why-us__card"
            :class="[
              `why-us__card--${card.key}`,
              { 'is-active': activeCard === index },
            ]"
            :aria-hidden="!reducedMotion && activeCard !== index"
            :inert="!reducedMotion && activeCard !== index ? true : undefined"
          >
            <div class="why-us__card-inner">
              <div
                v-if="card.video"
                class="wu-illu"
                :class="`wu-illu--${card.key}`"
              >
                <video
                  :ref="(el) => setVideoRef(el, index)"
                  :src="card.video"
                  muted
                  loop
                  playsinline
                  preload="auto"
                  :poster="reducedMotion ? card.poster : undefined"
                  @loadeddata="syncVideos(activeCard)"
                  disablepictureinpicture
                  aria-hidden="true"
                ></video>
              </div>

              <div class="wu-head" :class="{ 'wu-head--bottom': card.video }">
                <WhyUsText as="h3" class="wu-title" :text="card.title" />
                <WhyUsText as="p" class="wu-copy" :text="card.copy" />
              </div>

              <WhyUsNetwork
                v-if="card.key === 'together'"
                :active="!reducedMotion && sceneVisible && animatedCard === index"
              />
              <WhyUsSkills v-else-if="card.key === 'skills'" :active="!reducedMotion && sceneVisible && animatedCard === index" />
            </div>
          </AppCard>
        </div>
      </div>
    </div>

    </div>

    <div class="container why-us__layer">
      <h2 class="why-us__title">
        <span class="why-us__title-mobile"><WhyUsText text="Why clients stay with Northline" />{{ ' ' }}<WhyUsText class="why-us__brand-suffix" text="studio" /></span>
        <span class="why-us__title-desktop">
        <WhyUsText class="why-us__title-line" text="Why clients" />
        <WhyUsText class="why-us__title-line" text="stay with" />
        <span class="why-us__title-line"><WhyUsText text="Northline" /><WhyUsText class="why-us__brand-suffix" text="studio" /></span>
        </span>
      </h2>

      <div class="why-us__cta">
        <div v-for="(card, index) in cards" :key="card.key"
          :ref="(el) => setCtaRef(el, index)" class="why-us__cta-panel"
          :aria-hidden="activeCard !== index" :inert="activeCard !== index ? true : undefined">
          <WhyUsText as="p" :text="card.cta" />
          <AppLink :variant="card.buttonVariant" has-icon @click="openContactModal">Start a Project</AppLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { useContactModal } from '@/composables/useContactModal';
import AppLink from '@/components/ui/AppLink.vue';
import AppCard from '@/components/ui/AppCard.vue';
import WhyUsGlobe from './WhyUsGlobe.vue';
import WhyUsText from './WhyUsText.vue';
import WhyUsNetwork from './WhyUsNetwork.vue';
import WhyUsSkills from './WhyUsSkills.vue';
import { cards } from './why-us.data.js';

const { open: openContactModal } = useContactModal();
const cardRefs = ref([]);
const ctaRefs = [];
const videoRefs = [];
const activeCard = ref(0);
const sceneEntered = ref(false);
const animatedCard = ref(-1);
const sceneVisible = ref(false);
const sceneScale = ref(1);
const reducedMotion = ref(prefersReducedMotion());
let transition;
let inView = false;
function setCardRef(el, index) { if (el) cardRefs.value[index] = el.$el ?? el; }
function setCtaRef(el, index) { ctaRefs[index] = el; }
function setVideoRef(el, index) { videoRefs[index] = el ?? undefined; }
function syncVideos(index) {
  videoRefs.forEach((video, i) => {
    if (!video) return;
    if (i === index && inView && animatedCard.value === index && !prefersReducedMotion()) video.play().catch(() => {});
    else video.pause();
  });
}
function showCard(nextIndex, force = false) {
  if (!force && nextIndex === activeCard.value) return;
  const previousIndex = activeCard.value;
  const next = cardRefs.value[nextIndex];
  if (!next) return;
  transition?.kill();
  animatedCard.value = -1;
  syncVideos(-1);
  sceneEntered.value = true;
  activeCard.value = nextIndex;
  // Establish every state explicitly, including after an interrupted transition.
  gsap.set(cardRefs.value.filter((el, i) => el && i !== nextIndex && i !== previousIndex), { autoAlpha: 0, y: 0, filter: 'blur(0px)' });
  gsap.set(ctaRefs.filter((el, i) => el && i !== nextIndex && i !== previousIndex), { autoAlpha: 0 });
  const inner = next.querySelector('.why-us__card-inner');
  const heading = next.querySelectorAll('.wu-title .wu-text__char');
  const copy = next.querySelectorAll('.wu-copy .wu-text__char');
  const cta = ctaRefs[nextIndex];
  const ctaChars = cta.querySelectorAll('.wu-text__char');
  const button = cta.querySelector('.link');
  gsap.set(inner, { autoAlpha: 1, clearProps: 'clipPath' });
  transition = gsap.timeline({ defaults: { ease: 'power1.out' } });
  if (previousIndex !== nextIndex) {
    transition.to(cardRefs.value[previousIndex],
      { autoAlpha: 0, y: -48, duration: 0.4, ease: 'power2.in' }, 0)
      .to(cardRefs.value[previousIndex],
        { filter: 'blur(8px)', duration: 0.4, ease: 'power1.out' }, 0)
      .to(ctaRefs[previousIndex], { autoAlpha: 0, duration: 0.28 }, 0);

  }
  // Animate the complete card (face, colored backing and contents) together.
  transition.fromTo(next, { autoAlpha: 0, y: 56, filter: 'blur(0px)' },
    { autoAlpha: 1, y: 0, duration: 0.52, ease: 'power2.out' }, 0.06)
    .fromTo(heading, { opacity: 0, filter: 'blur(2px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.18, stagger: 0.012 }, 0.18)
    .fromTo(copy, { opacity: 0, filter: 'blur(1.5px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.18, stagger: 0.006 }, 0.24)
    .set(cta, { autoAlpha: 1 }, 0.18)
    .fromTo(ctaChars, { opacity: 0, filter: 'blur(2px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.2, stagger: 0.008 }, 0.2)
    .fromTo(button, { autoAlpha: 0, y: 3 }, { autoAlpha: 1, y: 0, duration: 0.28 }, 0.44)
    .call(() => { animatedCard.value = nextIndex; syncVideos(nextIndex); }, [], 0.22);
  const rows = next.querySelectorAll('.wu-skills__row');
  if (rows.length) transition.fromTo(rows, { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.3, stagger: 0.07 }, 0.2);
  if (videoRefs[nextIndex] && previousIndex !== nextIndex) videoRefs[nextIndex].currentTime = 0;
}
const section = useScrollScene((root) => {
  let intersects = false;
  const updateVisibility = () => {
    inView = intersects && !document.hidden;
    sceneVisible.value = inView;
    syncVideos(activeCard.value);
  };
  const visibility = new IntersectionObserver(([entry]) => {
    intersects = entry.isIntersecting;
    updateVisibility();
  }, { threshold: 0.05 });
  visibility.observe(root);
  document.addEventListener('visibilitychange', updateVisibility);
  const resize = () => { sceneScale.value = Math.min(root.clientWidth / 1920, root.clientHeight / 1080); };
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  resize();
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
    reducedMotion.value = !conditions.motion;
    transition?.kill();
    if (!conditions.motion) {
      sceneEntered.value = true;
      animatedCard.value = -1;
      syncVideos(-1);
      gsap.set(cardRefs.value, { clearProps: 'all' });
      gsap.set(ctaRefs, { autoAlpha: 0 });
      gsap.set(ctaRefs[activeCard.value], { autoAlpha: 1 });
      return;
    }
    gsap.set(cardRefs.value, { autoAlpha: 0 });
    gsap.set(ctaRefs, { autoAlpha: 0 });
    if (sceneEntered.value) showCard(activeCard.value, true);
    const intro = gsap.timeline({ scrollTrigger: {
      trigger: root, start: 'top 65%', once: true,
      toggleActions: 'play none none none',
    } });
    intro.fromTo(root.querySelector('.why-us__globe'), { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.28 }, 0)
      .call(() => { if (activeCard.value === 0) showCard(0, true); }, [], 0.3);
    root.querySelectorAll('.why-us__title-line').forEach((line, index) => {
      const chars = line.querySelectorAll('.wu-text__char');
      const start = 0.22 + index * 0.085;
      intro.fromTo(chars, { opacity: 0, color: '#eaffcb', textShadow: '0 0 7px #d7ff3f' },
        { opacity: 1, color: '#d7ff3f', duration: 0.1, stagger: 0.028, ease: 'none' }, start)
        .to(chars, { color: 'var(--blue-100)', textShadow: '0 0 0px transparent',
          duration: 0.22, stagger: 0.028, ease: 'none' }, start + 0.08);
    });
    ScrollTrigger.create({
      trigger: root, start: 'top top',
      end: () => `+=${Math.max(700, window.innerHeight * 0.8) * cards.length}`,
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => showCard(Math.min(cards.length - 1, Math.floor(self.progress * cards.length))),
    });
    return () => { transition?.kill(); syncVideos(-1); };
  });
  return () => { observer.disconnect(); visibility.disconnect(); document.removeEventListener('visibilitychange', updateVisibility); mm.revert(); transition?.kill(); syncVideos(-1); };
});
</script>

<style scoped>
.why-us {
  --why-scale: 1;
  --why-globe: calc(800px * var(--why-scale));
  scroll-margin-top: 0;

  position: relative;
  height: 100dvh;
  overflow: hidden;
  background: var(--white);
}

.why-us__stage {
  position: absolute;
  left: 50%;
  top: calc(50% + 40px * var(--why-scale));
  width: var(--why-globe);
  height: var(--why-globe);
  translate: -50% -50%;
  z-index: 1;
}
.why-us__globe {
  position: absolute;
  inset: 6.25%;
  display: block;
  width: 87.5%;
  height: 87.5%;
  pointer-events: none;
  user-select: none;
}

.why-us__layer {
  position: absolute;
  left: 50%;
  top: 0;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-block: clamp(40px, 6.8vh, 104px);
  pointer-events: none;
  z-index: 3;
}
.why-us__title {
  margin: 0;
  align-self: flex-start;
  color: var(--blue-100);
  font-family: var(--font-primary);
  font-weight: 600;
  line-height: 1;
}
.why-us__title-line {
  display: block;
  width: max-content;

}

.why-us__title-mobile { display: none; }

.why-us__brand {
  display: inline-flex;
  align-items: flex-start;
}
.why-us__brand-suffix {
  font-family: var(--font-mono);
  font-size: 0.25em;
  font-weight: 600;
  padding-top: 0.6em;
}
.why-us__cta {
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  gap: clamp(20px, 2.2vw, 32px);
  width: clamp(260px, 24vw, 345px);
  pointer-events: auto;
}
.why-us__cta-panel > p {
  margin: 0;
  color: var(--black-900);
  font-family: var(--font-mono);
  font-size: clamp(16px, 1.3vw, 20px);
  font-weight: 500;
  line-height: 1.6;
}

.why-us__slot {
  position: absolute;
  left: calc(50% + var(--dx));
  top: calc(50% + var(--dy));
  width: 318px;
  height: 400px;
  translate: -50% -50%;
  scale: var(--why-scale);
  z-index: 2;
  pointer-events: none;
}
.why-us__slot.is-active {
  pointer-events: auto;
}
.why-us__magnet {
  position: relative;
  width: 100%;
  height: 100%;
}

.why-us__card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: var(--black);
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  isolation: isolate;
}
.why-us__card::before,
.why-us__card::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--black);
  border-radius: var(--card-radius, 12px);
  pointer-events: none;
  z-index: -1;
}
.why-us__card::before {
  background: var(--card-plate-color);
  transform: translate(var(--card-plate-x), var(--card-plate-y));
}
.why-us__card::after {
  background: var(--white);
}
.why-us__card-inner {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  overflow: visible;
}

.why-us__slot--together {
  --dx: -24.13%;
  --dy: 24.25%;
}
.why-us__slot--process {
  --dx: 24.5%;
  --dy: -21.25%;
}
.why-us__slot--skills {
  --dx: -16.75%;
  --dy: 15.63%;
}
.why-us__slot--built {
  --dx: 26.13%;
  --dy: 1.38%;
}

.why-us__card--skills {
  --card-pad: 16px 16px 0;
}

.wu-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wu-head--bottom {
  gap: 12px;
  margin-top: auto;
}
.wu-title {
  margin: 0;
  color: var(--black-800);
  font-family: var(--font-primary);
  font-size: 42px;
  font-weight: 400;
  line-height: 1;
}
.wu-copy {
  margin: 0;
  color: var(--black);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
}

.wu-illu {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  overflow: visible;
}
.wu-illu video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.wu-illu--built {
  align-items: flex-start;
  margin-bottom: 8px;
}
/* Decorative backgrounds stay on the card surface; foreground content
   has no clipping container or reveal mask. */
.why-us__card--together::after {
  background-image: url('@/assets/images/why-us/network-halo.svg');
  background-size: 541px 541px;
  background-position: center 160px;
  background-repeat: no-repeat;
}
.why-us__card--skills::after {
  background-image: url('@/assets/images/why-us/skills-halo.svg');
  background-size: 453px 453px;
  background-position: center 130px;
  background-repeat: no-repeat;
}

@media (width >= 1024px) {
  .why-us {
    --why-fit: min(1px, 100vw / 1800, (50dvh - 24px) / 434);
    --why-scale: tan(atan2(var(--why-fit), 1px));
  }
}
@media (width < 1024px) {
  .why-us {
    --why-scale: 0.86;
    --why-globe: min(
      calc(100vw - 2 * var(--container-padding-mobile)),
      44vh,
      512px
    );
  }
  .why-us__stage {
    top: calc(50% - 45px);
  }
  .why-us__globe {
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .why-us__layer {
    align-items: stretch;
  }
  .why-us__cta {
    align-self: stretch;
    width: 100%;
    max-width: 358px;
    margin-inline: auto;
    gap: 32px;
  }
  .why-us__cta-panel > p {
    font-size: 14px;
  }

  .why-us__cta :deep(.link) {
    width: 100%;
    max-width: none;
    justify-content: space-between;
  }

  .why-us__slot {
    width: 256px;
    height: 327px;
  }
  .why-us__card {
    --card-pad: 12px;
  }
  .why-us__card--skills {
    --card-pad: 12px 12px 0;
  }
  .wu-title {
    font-size: 32px;
    font-weight: 600;
  }
  .wu-copy {
    font-size: 14px;
  }

  .why-us__slot--together {
    --dx: -8.66%;
    --dy: 26.4%;
  }
  .why-us__slot--process {
    --dx: 10.89%;
    --dy: -1.54%;
  }
  .why-us__slot--skills {
    --dx: -8.66%;
    --dy: 6.84%;
  }
  .why-us__slot--built {
    --dx: 10.89%;
    --dy: 15.22%;
  }

  .why-us__card--process .wu-illu {
    order: 1;
  }
  .why-us__card--process .wu-head--bottom {
    order: 0;
    margin-top: 0;
    margin-bottom: 12px;
  }
}

@media (width < 1024px) and (height <= 720px) {
  .why-us { --why-scale: 0.68; }
  .why-us__layer { padding-block: 24px; }
  .why-us__title { font-size: 28px; }
  .why-us__stage { top: calc(50% - 35px); }
}
.why-us--static { height: auto; overflow: visible; padding-block: 80px; }
.why-us--static .why-us__stage {
  position: relative; inset: auto; width: 100%; height: auto; translate: none;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; padding: 40px 20px;
}
.why-us--static .why-us__globe { display: none; }
.why-us--static .why-us__slot {
  position: relative; inset: auto; translate: none; scale: 1; pointer-events: auto;
}
.why-us--static .why-us__layer {
  position: relative; inset: auto; translate: none; height: auto; gap: 32px;
}
.why-us--static .why-us__title { -webkit-text-fill-color: currentColor; }
.why-us__scene { display: contents; }
.why-us__cta { position: relative; min-height: 190px; }
.why-us__cta-panel {
  position: absolute; inset: auto 0 0;
  display: flex; flex-direction: column; align-items: flex-start; gap: 20px;
  opacity: 0; visibility: hidden;
}
@media (width >= 1024px) {
  .why-us { --why-scale: 1; }
  .why-us__scene {
    display: block; position: absolute; left: 50%; top: 50%;
    width: 1920px; height: 1080px;
    transform: translate(-50%, -50%) scale(var(--scene-scale));
    transform-origin: center;
  }
  .why-us__stage { left: 960px; top: 580px; width: 800px; height: 800px; }
  .why-us__globe { inset: 50px; width: 700px; height: 700px; }
  .why-us__layer {
    width: min(calc(100% - 80px), 1440px); max-width: none; height: 100%;
    padding: clamp(64px, 10.7dvh, 144px) 0 calc((100vw - max(75vw, min(1440px, 100vw - 2 * var(--container-padding)))) / 2);
  }
  .why-us__title { font-size: clamp(52px, 3.958vw, 76px); }
  .why-us__title-line { padding-right: 3px; }
  .why-us__brand-suffix { display: inline-block; vertical-align: top; font-size: 0.2em; padding-top: 0.65em; }
  .why-us__cta { width: clamp(260px, 18vw, 345px); min-height: 220px; }
  .why-us__cta-panel > p { font-size: clamp(16px, 1.042vw, 20px); line-height: 1.6; }
  .why-us__slot { scale: 1; }
  .why-us__slot--together { --dx: -24.13%; --dy: 24.25%; }
  .why-us__slot--process { --dx: 24.5%; --dy: -21.25%; }
  .why-us__slot--skills { --dx: -16.75%; --dy: 15.63%; }
  .why-us__slot--built { --dx: 26.13%; --dy: 1.38%; }
  .wu-title { font-size: 34px; font-weight: 600; }
}
@media (1024px <= width < 1600px) {
  .why-us__globe {
    --globe-extra: clamp(0px, calc((1600px - 100vw) * 0.16154), 42px);
    inset: calc(50px - var(--globe-extra));
    width: calc(700px + 2 * var(--globe-extra));
    height: calc(700px + 2 * var(--globe-extra));
  }
}
@media (width < 1024px) {
  .why-us__title { font-size: clamp(32px, 6vw, 52px); }
  .why-us__cta-panel { gap: 20px; }
  .why-us__card--together::after { background-size: 435px 435px; background-position: center 128px; }
  .why-us__card--skills::after { background-size: 364px 364px; background-position: center 110px; }
}

@media (width < 768px) {
  .why-us__title-desktop { display: none; }
  .why-us__title-mobile { display: inline; }
  .why-us__title {
    width: 100%;
    font-size: clamp(30px, 8.6vw, 36px);
    line-height: 1.08;
    text-wrap: balance;
  }
  .why-us__title-mobile .why-us__brand-suffix {
    display: inline-block;
    vertical-align: top;
    padding-top: 0.6em;
  }
}
.why-us--static .why-us__scene { display: contents; }
.why-us--static :deep(.wu-text__char) {
  opacity: 1 !important; filter: none !important; color: inherit !important; text-shadow: none !important;
}
.why-us--static .why-us__card-inner { opacity: 1 !important; visibility: visible !important; clip-path: none !important; }
.why-us--static .why-us__layer { width: min(100%, 1296px); }
</style>
