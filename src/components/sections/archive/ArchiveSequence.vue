<template>
  <section ref="rootRef" class="seq" :class="[{ 'seq--static': isStatic }, handoff && `seq--${handoff}`]">
    <div ref="stageRef" class="seq__stage">
      <canvas ref="canvasRef" class="seq__canvas"></canvas>

      <div
        v-if="$slots.intro"
        ref="introRef"
        class="seq__intro"
        :style="{ '--seq-scale': scale }"
      >
        <slot name="intro" :rects="rects" />
      </div>

      <div
        v-if="$slots.overlay"
        class="seq__overlay"
        :class="{ 'is-live': live }"
        :style="{ '--seq-scale': scale }"
        :inert="live ? undefined : true"
      >
        <slot name="overlay" :rects="rects" :live="live" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { useImageSequence } from '@/composables/useImageSequence';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { useHeaderLock } from '@/composables/useHeaderLock';

const props = defineProps({
  frames: { type: Array, required: true },
  handoff: { type: String, default: '' },
  span: { type: Number, default: 3 },
  introHold: { type: Number, default: 0 },
  introExit: { type: Number, default: 0.12 },
  introLayout: { type: Function, default: null },
  outroHold: { type: Number, default: 0 },
  outroScale: { type: Number, default: 1 },
  hotspots: { type: Array, default: () => [] },
  reducedFrame: { type: String, default: 'last' },
});

const rootRef = ref(null);
const stageRef = ref(null);
const canvasRef = ref(null);
const introRef = ref(null);

const rects = ref({});
const scale = ref(1);
const live = ref(false);

const isStatic = ref(prefersReducedMotion());

const { setHeaderLock } = useHeaderLock();
const headerLockKey = Symbol('archive-sequence');

const sequence = useImageSequence(props.frames);
const lastIndex = computed(() => props.frames.length - 1);

const frameState = { i: 0, fit: props.introLayout ? 1 : 0 };
const OPENING_HANDOFF = 0.08;

function frameBox() {
  const canvas = canvasRef.value;
  if (!canvas) return undefined;
  const cover = sequence.geometry(canvas);
  if (props.outroScale !== 1) {
    const progress = Math.max(0, Math.min(1, (frameState.i / Math.max(1, lastIndex.value) - 0.55) / 0.45));
    const smooth = progress * progress * (3 - 2 * progress);
    const factor = 1 + (props.outroScale - 1) * smooth;
    const drawW = cover.drawW * factor, drawH = cover.drawH * factor;
    return { drawW, drawH, offsetX: (cover.boxW - drawW) / 2,
      offsetY: (cover.boxH - drawH) / 2 };
  }
  if (!props.introLayout || frameState.fit <= 0) return undefined;
  const intro = props.introLayout(cover.boxW, cover.boxH);
  const mix = (key) => cover[key] + (intro[key] - cover[key]) * frameState.fit;
  return { offsetX: mix('offsetX'), offsetY: mix('offsetY'),
    drawW: mix('drawW'), drawH: mix('drawH') };
}

function paint() {
  sequence.draw(canvasRef.value, frameState.i, frameBox());
  live.value = isStatic.value || Math.round(frameState.i) >= lastIndex.value;
  if (props.hotspots.length) measure();
}

function measure() {
  if (!canvasRef.value) return;

  const geo = sequence.geometry(canvasRef.value);
  const box = frameBox();
  scale.value = box ? box.drawW / 1920 : geo.scale;
  if (!props.hotspots.length) return;

  rects.value = Object.fromEntries(
    props.hotspots.map((spot) => {
      const r = sequence.mapRect(canvasRef.value, spot, box);
      if (!r) return [spot.key, {}];

      const inset = spot.minInset ?? 0;
      let { left, width } = r;

      if (left < inset) {
        width -= inset - left;
        left = inset;
      }
      if (left + width > geo.boxW - inset) {
        width = geo.boxW - inset - left;
      }

      return [
        spot.key,
        {
          left: `${left}px`,
          top: `${r.top}px`,
          width: `${Math.max(0, width)}px`,
          height: `${r.height}px`,
        },
      ];
    }),
  );
}
function onResize() {
  paint();
  measure();
}

useScrollScene(
  (root) => {
    let mounted = true;

    sequence.load().then(async () => {
      if (!mounted) return;
      await nextTick();

      paint();
      measure();
      ScrollTrigger.refresh();
    });

    window.addEventListener('resize', onResize);

    ScrollTrigger.create({
      trigger: root,
      start: () =>
        `top ${document.querySelector('.header')?.offsetHeight ?? 0}px`,
      end: 'bottom top',
      refreshPriority: -1,
      invalidateOnRefresh: true,
      onToggle: (self) => setHeaderLock(headerLockKey, self.isActive),
      onRefresh: (self) => setHeaderLock(headerLockKey, self.isActive),
    });

    if (isStatic.value) {
      frameState.i = props.reducedFrame === 'first' ? 0 : lastIndex.value;
      live.value = true;
      if (sequence.firstFrameReady.value) paint();
      return () => {
        mounted = false;
        window.removeEventListener('resize', onResize);
        setHeaderLock(headerLockKey, false);
      };
    }

    if (introRef.value) {
      const heading = introRef.value.querySelectorAll('.archive__headline .archive-copy__char');
      const words = introRef.value.querySelectorAll('.archive__lead .archive-copy__word');
      const blue = getComputedStyle(root).getPropertyValue('--blue-100').trim();
      const lime = getComputedStyle(root).getPropertyValue('--lime-400').trim();
      gsap.timeline({ scrollTrigger: {
        trigger: root, start: 'top 65%', toggleActions: 'play none none reverse',
      } })
        .fromTo(canvasRef.value, { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0)
        .fromTo(heading, { opacity: 0, color: lime, filter: 'blur(3px)', y: 3 },
          { opacity: 1, color: blue, filter: 'blur(0px)', y: 0, duration: 0.4, stagger: 0.025, ease: 'power2.out' }, 0.1)
        .fromTo(words, { opacity: 0, filter: 'blur(3px)', y: 4 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' }, 0.3);
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * (props.span + props.outroHold)}`,
        pin: stageRef.value,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => {
          if (sequence.firstFrameReady.value) paint();
        },
      },
    });

    if (props.handoff === 'ending') {
      timeline.fromTo(stageRef.value, { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.1, ease: 'none' });
    }

    if (props.introHold > 0 && introRef.value) {
      timeline.to({}, { duration: props.introHold }).to(introRef.value, {
        y: -20,
        filter: 'blur(4px)',
        autoAlpha: 0,
        ease: 'power2.in',
        duration: props.introExit,
      });

      if (props.introLayout) {
        timeline.to(
          frameState,
          {
            fit: 0,
            ease: 'power2.inOut',
            duration: props.introExit,
            onUpdate: paint,
          },
          '<',
        );
      }
    }

    timeline.to(frameState, {
      i: lastIndex.value,
      snap: 'i',
      ease: 'none',
      duration: Math.max(0.1, 1 - props.introHold - props.introExit - (props.handoff === 'opening' ? OPENING_HANDOFF : 0)),
      onUpdate: paint,
    });

    if (props.handoff === 'opening') {
      timeline.to({}, { duration: OPENING_HANDOFF });
      timeline.fromTo(stageRef.value,
        { '--seq-handoff-color': 'rgba(1, 3, 138, 0)' },
        {
          '--seq-handoff-color': getComputedStyle(root).getPropertyValue('--archive-screen').trim(),
          duration: 0.08, ease: 'none', immediateRender: false,
        }, 0.62);
    }

    if (props.outroHold > 0) {
      timeline.to(
        {},
        { duration: (timeline.duration() * props.outroHold) / props.span },
      );
    }

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      setHeaderLock(headerLockKey, false);
    };
  },
  { root: rootRef },
);

watch(
  () => props.frames,
  () => paint(),
);

onBeforeUnmount(() => window.removeEventListener('resize', onResize));
</script>

<style scoped>
.seq {
  position: relative;
}

@media (width >= 768px) and (prefers-reduced-motion: no-preference) {
  .seq--ending { margin-top: -100dvh; z-index: 2; }
}

.seq__stage {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100dvh;
  background: var(--white);
}

/* The initial frames contain white pixels. Let the current service color
   show through them while both sections share the viewport. */
.seq--opening .seq__stage {
  background: linear-gradient(var(--seq-handoff-color, transparent), var(--seq-handoff-color, transparent)),
    var(--page-bg, var(--white));
  transition: background-color 0.5s ease;
}

.seq--opening .seq__canvas {
  mix-blend-mode: var(--services-preview-blend, normal);
}

@media (prefers-reduced-motion: reduce) {
  .seq--opening .seq__stage { transition: none; }
}

/* The overlapping exit scene must leave the archive controls clickable. */
.seq--ending { pointer-events: none; }

.seq--static .seq__stage {
  height: auto;
  aspect-ratio: 16 / 9;
}

.seq__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.seq__intro {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.seq__intro :deep(a),
.seq__intro :deep(button) {
  pointer-events: auto;
}

.seq__overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.35s var(--transition-timing),
    visibility 0s linear 0.35s;
}

.seq__overlay.is-live {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.seq__overlay :deep(*) {
  pointer-events: auto;
}
</style>
