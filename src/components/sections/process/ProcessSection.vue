<template>
  <section id="process" ref="processRef" class="process">
    <div ref="contentRef" class="process__content">
      <article
        v-for="item in items"
        :key="item.title"
        class="process__stat"
        :style="{ '--text-w': item.textWidth, '--img-scale': item.imgScale }"
      >
        <div
          class="process__stat-bg"
          aria-hidden="true"
          :style="{ backgroundImage: `url(${item.background})` }"
        ></div>
        <div class="process__wrapper-text">
          <div class="process__stat-process">
            <div
              class="process__stat-label process__stat-label--process"
              :style="{
                backgroundColor: item.color,
                color: item.isLight ? 'black' : 'white',
                boxShadow: item.boxShadow,
              }"
            >
              {{ item.label }}
            </div>
            <div class="process__stat-label process__stat-label--date">
              {{ item.date }}
            </div>
          </div>
          <h2 class="process__stat-title" :style="{ color: item.titleColor }">
            {{ item.title }}
          </h2>
          <p class="process__stat-text">
            {{ item.text }}
          </p>
        </div>
        <div class="process__wrapper-img">
          <img :src="item.img" :alt="item.title" decoding="async" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { gsap } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { atLeast } from '@/composables/useBreakpoints';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { createHorizontalScrub } from '@/composables/useHorizontalScrub';
import discoveryImg from '@/assets/images/process/discovery.webp';
import discoveryTextImg from '@/assets/images/process/discovery-text.webp';
import strategyImg from '@/assets/images/process/strategy.webp';
import strategyTextImg from '@/assets/images/process/strategy-text.webp';
import executionImg from '@/assets/images/process/execution.webp';
import executionTextImg from '@/assets/images/process/execution-text.webp';
import guardianshipImg from '@/assets/images/process/guardianship.webp';
import guardianshipTextImg from '@/assets/images/process/guardianship-text.webp';

const contentRef = ref(null);

const items = [
  {
    label: 'Process',
    date: '01/04',
    title: 'Discovery',
    text: 'We start by understanding your business, audience, and goals. Together, we uncover the real challenge, define priorities, and turn scattered ideas into a clear direction.',
    img: discoveryImg,
    background: discoveryTextImg,
    color: 'var(--pink-200)',
    titleColor: 'var(--pink-400)',
    textWidth: 533,
    imgScale: 1.124,
    boxShadow:
      '0 -3px 0 0 rgba(185, 91, 141, 0.26) inset, 0 2px 0 0 rgba(255, 240, 247, 0.48) inset, 0 0 0 1px rgba(255, 216, 233, 0.72) inset',
  },
  {
    label: 'Process',
    date: '02/04',
    title: 'Strategy',
    text: 'We translate what we learn into a focused creative strategy. This gives every design, message, and decision a purpose while keeping the entire project aligned.',
    img: strategyImg,
    background: strategyTextImg,
    color: 'var(--lime-600)',
    titleColor: 'var(--lime-600)',
    isLight: true,
    textWidth: 518,
    boxShadow: '0 3px 0 0 rgba(255, 255, 255, 0.62) inset',
  },
  {
    label: 'Process',
    date: '03/04',
    title: 'Execution',
    text: 'This is where the strategy becomes something real. We design, refine, and build every detail into a clear, cohesive experience ready to meet the world.',
    img: executionImg,
    background: executionTextImg,
    color: 'var(--yellow-100)',
    titleColor: 'var(--yellow-100)',
    isLight: true,
    textWidth: 496,
    boxShadow: '0 3px 0 0 rgba(255, 255, 255, 0.62) inset',
  },
  {
    label: 'Process',
    date: '04/04',
    title: 'Guardianship',
    text: 'After launch, we stay involved to keep everything consistent, relevant, and moving forward. We support new ideas, improve what already exists, and help the brand grow with confidence.',
    img: guardianshipImg,
    background: guardianshipTextImg,
    color: 'var(--blue-800)',
    titleColor: 'var(--blue-800)',
    textWidth: 610,
    boxShadow:
      '0 -3px 0 0 rgba(10, 74, 168, 0.32) inset, 0 2px 0 0 rgba(169, 210, 255, 0.55) inset, 0 0 0 1px rgba(125, 181, 255, 0.75) inset',
  },
];

const SIDE_BY_SIDE = `${atLeast('tablet')} and (aspect-ratio > 1)`;

const PARALLAX = [
  // The background counter-moves against the track, while the foreground
  // illustration leads it. Opposite signs separate their apparent speeds.
  { selector: '.process__wrapper-img', shift: -0.24 },
  { selector: '.process__stat-bg', shift: 0.24 },
  { selector: '.process__wrapper-text', shift: 0.015 },
];

function addParallax(root, scrub) {
  const panels = [...root.querySelectorAll('.process__stat')];
  const safeBackgroundShift = () => {
    if (panels.length < 2) return 0;
    const spacing = panels[1].offsetLeft - panels[0].offsetLeft;
    const letteringWidth = panels[0].querySelector('.process__stat-bg').offsetWidth;
    // Counter-motion closes the distance between adjacent background layers.
    // Reserve 64px between their full bounds, rather than hiding the collision.
    return spacing > 0 ? Math.max(0, (spacing - letteringWidth - 64) / spacing) : 0;
  };
  panels.forEach((stat) => {
    // Follow scroll progress rather than one-shot enter/leave callbacks, so
    // reversing direction restores the previous lettering continuously.
    gsap.timeline({ scrollTrigger: {
      trigger: stat, containerAnimation: scrub,
      start: 'left right', end: 'right left', scrub: true,
      invalidateOnRefresh: true,
    } })
      .fromTo(stat.querySelector('.process__stat-bg'), { opacity: 0 },
        { opacity: 0.1, duration: 0.4, ease: 'sine.inOut' })
      .to(stat.querySelector('.process__stat-bg'), { opacity: 0.1, duration: 0.2, ease: 'none' })
      .to(stat.querySelector('.process__stat-bg'), { opacity: 0, duration: 0.4, ease: 'sine.inOut' });
    PARALLAX.forEach(({ selector, shift }) => {
      const travel = () => window.innerWidth * (selector === '.process__stat-bg'
        ? Math.min(shift, safeBackgroundShift()) : shift);
      gsap.fromTo(
        stat.querySelectorAll(selector),
        { x: () => -travel() },
        {
          x: () => travel(),
          ease: 'none',
          scrollTrigger: {
            trigger: stat,
            containerAnimation: scrub,
            start: 'left right',
            end: 'right left',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  });
}

const processRef = useScrollScene((el) => {
  if (prefersReducedMotion()) return;
  const track = contentRef.value;
  const scrub = createHorizontalScrub(el, track, {
    // Stop with the last panel in the same position as the first. scrollWidth
    // includes transformed parallax artwork protruding beyond the last panel,
    // so using it here overshoots and cuts off the final heading and copy.
    distance: () => {
      const first = track.firstElementChild;
      const last = track.lastElementChild;
      return first && last ? last.offsetLeft - first.offsetLeft : 0;
    },
  });
  if (!scrub) return;

  const mm = gsap.matchMedia();
  mm.add(SIDE_BY_SIDE, () => addParallax(el, scrub));

  return () => mm.revert();
});
</script>

<style scoped>
.process {
  position: relative;
  overflow: hidden;
}

.process__content {
  display: flex;
  width: max-content;
  height: 100vh;
  will-change: transform;
}

.process__stat {
  position: relative;
  min-width: 0;
  flex-shrink: 0;
  height: 100vh;
}

.process__stat-bg {
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  opacity: 0.1;
}

.process__wrapper-text {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--process-text-gap);
  min-width: 0;
}

.process__stat-process {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--process-tag-gap);
}

.process__stat-title {
  font-weight: 600;
  line-height: 1;
  overflow-wrap: break-word;
}

.process__stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--process-label-width);
  height: var(--process-label-height);
  padding: 0;
  border: var(--process-label-border) solid var(--black);
  border-radius: var(--process-label-radius);
  font-family: var(--font-mono);
  font-size: var(--process-label-font);
  font-weight: 500;
  line-height: normal;
  text-align: center;
  white-space: nowrap;
}

.process__stat-label--date {
  background: var(--white);
  box-shadow:
    0 -3px 0 0 rgba(191, 191, 191, 0.28) inset,
    0 2px 0 0 rgba(235, 235, 235, 0.5) inset,
    0 0 0 1px rgba(230, 230, 230, 0.75) inset;
}

.process__stat-text {
  font-family: var(--font-mono);
  font-size: var(--process-text-font);
  font-weight: 500;
  line-height: 1.6;
  overflow-wrap: break-word;
}

.process__wrapper-img {
  position: relative;
}

.process__wrapper-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (width >= 1024px) and (aspect-ratio > 1) {
  .process {
    --grid: max(75vw, min(1440px, 100vw - 2 * var(--container-padding)));
    --grid-x: calc((100vw - var(--grid)) / 2);
    --s: min(calc(var(--grid) / 1440), calc(100vh / 1024));
    --scene-y: max(0px, calc((100vh - 1024 * var(--s)) / 2));
    --process-text-gap: calc(26 * var(--s));
    --process-tag-gap: calc(22 * var(--s));
    --process-label-font: max(12px, calc(16 * var(--s)));
    --process-label-width: calc(155 * var(--s));
    --process-label-height: calc(48 * var(--s));
    --process-label-radius: max(6px, calc(8 * var(--s)));
    --process-label-border: max(1px, calc(2 * var(--s)));
    --process-text-font: max(14px, calc(20 * var(--s)));
  }

  .process__content {
    gap: calc(49 * var(--s));
  }

  .process__stat {
    width: 100vw;
  }

  .process__stat-bg {
    position: absolute;
    top: calc(var(--scene-y) + 87 * var(--s));
    left: var(--grid-x);
    width: calc(1440 * var(--s));
    height: calc(504 * var(--s));
    background-size: cover;
  }

  .process__wrapper-img {
    position: absolute;
    right: var(--grid-x);
    bottom: calc(var(--scene-y) + 90 * var(--s));
    overflow: hidden;
    width: calc(763 * var(--s));
    aspect-ratio: 1;
  }

  .process__wrapper-img img {
    scale: var(--img-scale, 1);
  }

  .process__wrapper-text {
    position: absolute;
    left: var(--grid-x);
    bottom: var(--container-padding);
    width: max(320px, calc(var(--text-w, 533) * var(--s)));
  }

  .process__stat-text {
    min-height: 4lh;
  }

  .process__stat-label--date {
    width: calc(145 * var(--s));
  }

  .process__stat-title {
    font-size: max(44px, calc(92 * var(--s)));
    white-space: nowrap;
  }
}

@media (width < 1024px), (aspect-ratio <= 1) {
  .process {
    --k: min(calc(100vw / 390), calc(100vh / 844));
    --process-text-gap: max(12px, calc(26 * var(--k)));
    --process-tag-gap: max(12px, calc(20 * var(--k)));
    --process-label-font: max(11px, calc(14 * var(--k)));
    --process-label-width: max(84px, calc(100 * var(--k)));
    --process-label-height: max(34px, calc(42 * var(--k)));
    --process-label-radius: max(8px, calc(8 * var(--k)));
    --process-label-border: max(1px, calc(1 * var(--k)));
    --process-text-font: max(11px, calc(14 * var(--k)));
  }

  .process__content {
    gap: calc(40 * var(--k));
  }

  .process__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100dvw;
    min-width: 390px;
    padding-block-start: calc(32 * var(--k));
    overflow: hidden;
  }

  .process__wrapper-img {
    order: 1;
    flex: 0 0 auto;
    width: min(100%, calc(344 * var(--k)));
    height: calc(311 * var(--k));
  }

  .process__stat-bg {
    order: 2;
    flex: 0 0 auto;
    width: min(100%, calc(390 * var(--k)));
    height: calc(130 * var(--k));
    margin-block-start: calc(45 * var(--k));
    background-size: cover;
    opacity: 0.3;
  }

  .process__wrapper-text {
    order: 3;
    flex: 1 1 auto;
    width: min(100%, calc(390 * var(--k)));
    margin-block-start: calc(46 * var(--k));
    padding-inline: calc(16 * var(--k));
    overflow: hidden;
  }

  .process__stat-process {
    flex: 0 0 auto;
  }

  .process__stat-title {
    flex: 0 0 auto;
    font-size: max(26px, calc(44 * var(--k)));
  }

  .process__stat-text {
    flex: 1 1 auto;
    min-height: 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 7;
    overflow: hidden;
  }
}
@media (prefers-reduced-motion: reduce) {
  .process__content { display: block; width: 100%; height: auto; }
  .process__stat { width: 100%; min-width: 0; min-height: 100svh; }
}
</style>
