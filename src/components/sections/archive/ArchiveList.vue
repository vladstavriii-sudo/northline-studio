<template>
  <section
    id="archive"
    ref="sectionRef"
    class="list"
    :class="{ 'list--gallery': isGallery }"
    aria-labelledby="archive-heading"
  >
    <div v-if="isGallery" class="container list__stage">
      <ArchiveGallery :projects="projects" v-slot="{ count: galleryCount }">
        <header class="list__head list__head--center">
          <p class="list__count">({{ galleryCount }})</p>
          <h2 id="archive-heading" class="list__title">Archive</h2>
        </header>
      </ArchiveGallery>
    </div>

    <div v-else class="container">
      <header class="list__head">
        <h2 id="archive-heading" class="list__title">Archive</h2>
        <p class="list__count">{{ count }}</p>
      </header>

      <div class="list__rows">
        <template v-for="(project, i) in projects" :key="project.slug">
          <span class="list__rule" aria-hidden="true"></span>
          <ArchiveRow
            :project="project"
            :index="i"
            :layout="LAYOUTS[i % LAYOUTS.length]"
          />
        </template>
        <span class="list__rule" aria-hidden="true"></span>
      </div>
    </div>

    <div class="list__more">
      <button
        type="button"
        class="list__more-btn"
        :class="{ 'is-pressed': isGallery }"
        :aria-pressed="isGallery"
        :disabled="isSwitching"
        aria-label="Gallery view"
        @click="toggleView"
      >
        <img class="list__more-idle" :src="buttonIcon" alt="" />
        <img class="list__more-hover" :src="isGallery ? disabledIcon : pressedIcon" alt="" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import ArchiveRow from './ArchiveRow.vue';
import ArchiveGallery from './ArchiveGallery.vue';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { coverPage, revealPage } from '@/composables/usePixelTransition';
import { freezeScroll, settleOn } from '@/utils/scroll';
import { padIndex } from '@/content/projects.data.js';
import pressedIcon from '@/assets/icons/archive/switch-view-pressed.svg';
import disabledIcon from '@/assets/icons/archive/switch-view-disabled.svg';

const props = defineProps({
  projects: { type: Array, required: true },
});

const sectionRef = useScrollScene((root) => {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let reveal;
    const stop = watch(isGallery, (gallery) => {
      reveal?.revert();
      if (gallery) return;
      reveal = gsap.context(() => {
        gsap.fromTo(root.querySelector('.list__head'),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5,
            scrollTrigger: { trigger: root, start: 'top 90%', toggleActions: 'play none none reverse' } });

        root.querySelectorAll('.list__rule').forEach((rule) => {
          gsap.fromTo(rule, { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: rule, start: 'top 94%', toggleActions: 'play none none reverse' } });
        });

        root.querySelectorAll('.row').forEach((row) => {
          gsap.timeline({ scrollTrigger: {
            trigger: row, start: 'top 92%', toggleActions: 'play none none reverse',
          } })
            .fromTo(row.querySelectorAll('.row__cell'), { autoAlpha: 0, y: 8 },
              { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.045, ease: 'power2.out' }, 0)
            .fromTo(row.querySelector('.row__cover'), { clipPath: 'inset(50% 0% 50% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out' }, 0.1)
            .fromTo(row.querySelector('.row__arrow'), { autoAlpha: 0, x: -8 },
              { autoAlpha: 1, x: 0, duration: 0.3 }, 0.25);
        });
      }, root);
    }, { immediate: true, flush: 'post' });
    return () => { stop(); reveal?.revert(); };
  });
  return () => mm.revert();
});
const isGallery = ref(false);
const isSwitching = ref(false);

const count = computed(() => `(${padIndex(props.projects.length)})`);

const buttonIcon = computed(() => {
  if (isSwitching.value) return disabledIcon;
  return isGallery.value ? pressedIcon : disabledIcon;
});

async function toggleView() {
  if (isSwitching.value) return;
  isSwitching.value = true;
  const release = freezeScroll();

  try {
    await coverPage();
    isGallery.value = !isGallery.value;
    await nextTick();
    ScrollTrigger.refresh();
    await settleOn(sectionRef.value);
    await revealPage();
  } finally {
    await release();
    isSwitching.value = false;
  }
}

const ROTATE = { title: 'focus', focus: 'date', date: 'index', index: 'title' };

const pct = (px) => `${((px / 1440) * 100).toFixed(4)}%`;

const place = (cover, cells, narrow) => ({
  cover: pct(cover),
  narrowCover: narrow.cover,
  narrowArrow: narrow.arrow,
  cells: cells.map(([idle, x, y]) => ({
    idle,
    hover: ROTATE[idle],
    x: pct(x),
    y,
    narrowCol: narrow.cells[idle][0],
    narrowRow: narrow.cells[idle][1],
  })),
});

const LAYOUTS = [
  place(
    569,
    [
      ['title', 243, 'top'],
      ['focus', 1095, 'top'],
      ['date', 0, 'bottom'],
      ['index', 973, 'bottom'],
    ],
    {
      cover: 2,
      arrow: 3,
      cells: { title: [1, 1], focus: [3, 1], date: [1, 3], index: [3, 3] },
    },
  ),
  place(
    0,
    [
      ['focus', 415, 'top'],
      ['title', 902, 'top'],
      ['index', 537, 'bottom'],
      ['date', 1145, 'bottom'],
    ],
    {
      cover: 1,
      arrow: 3,
      cells: { focus: [2, 1], index: [2, 3], date: [3, 1], title: [3, 3] },
    },
  ),
  place(
    1056,
    [
      ['index', 0, 'top'],
      ['title', 487, 'top'],
      ['date', 122, 'bottom'],
      ['focus', 660, 'bottom'],
    ],
    {
      cover: 3,
      arrow: 2,
      cells: { index: [1, 1], date: [1, 3], focus: [2, 1], title: [2, 3] },
    },
  ),
];
</script>

<style scoped>
.list {
  position: relative;
  z-index: 1;
  scroll-margin-top: 0;
  padding: 116px 0 100px;
  background: linear-gradient(var(--archive-screen), #030084);
  color: var(--white);
  font-family: var(--font-display);
}

.list > .container {
  container-type: inline-size;
}

@media (width >= 768px) and (prefers-reduced-motion: no-preference) {
  /* Keep blue behind the transparent exit scene after the list leaves view. */
  .list::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 100dvh;
    background: #030084;
    pointer-events: none;
  }
}

.list__rows {
  --row-h: calc(179cqw / 14.4);
  --row-font: max(16px, calc(22cqw / 14.4));
}

.list__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 64px;
  text-transform: uppercase;
  line-height: 1;
}

.list__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(56px, 8.3vw, 120px);
  font-weight: 400;
  line-height: 1;
}

.list__count {
  margin: 0;
  color: var(--archive-lav);
  font-size: clamp(26px, 3.3vw, 48px);
  line-height: 1;
}

.list__head.list__head--center {
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin: 0;
  text-align: center;
}

.list__head--center .list__count {
  color: var(--white);
  font-size: clamp(20px, 1.95vw, 28px);
}

.list__rule {
  display: block;
  height: 3px;
  background:
    linear-gradient(var(--archive-lav), var(--archive-lav)) left / 60% 100%
      no-repeat,
    linear-gradient(var(--archive-lav), var(--archive-lav)) right / 39.9% 100%
      no-repeat;
}

.list__rows > .row {
  margin-block: 32px;
}

.list__more {
  position: sticky;
  bottom: 32px;
  z-index: 2;
  display: flex;
  justify-content: center;
  margin-top: 64px;
  pointer-events: none;
}

.list__more-btn {
  pointer-events: auto;
}

.list__more-btn:disabled {
  cursor: default;
}

.list__more-btn {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 0;
  background: none;
  cursor: var(--cursor-pointer);

}

.list__more-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--white);
  clip-path: polygon(5% 0,95% 0,95% 5%,100% 5%,100% 95%,95% 95%,95% 100%,5% 100%,5% 95%,0 95%,0 5%,5% 5%);
  translate: 3px 3px;
  transition: translate .2s ease;
}
.list__more-btn img {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: 100%;
}

.list__more-hover { opacity: 0; }
.list__more-btn:is(:hover, :focus-visible):not(:disabled)::before { translate: 0 0; }
.list__more-btn:is(:hover, :focus-visible):not(:disabled) .list__more-idle { opacity: 0; }
.list__more-btn:is(:hover, :focus-visible):not(:disabled) .list__more-hover { opacity: 1; }

.list__more-btn:focus-visible {
  outline: 2px solid var(--pixel-orange);
  outline-offset: 6px;
}

@media (width < 1024px) {
  .list__head {
    margin-bottom: 40px;
  }

  .list__rows > .row {
    margin-block: 22px;
  }
}

@media (width < 768px) {
  .list {
    padding: 112px 0 64px;
  }

  .list__head {
    margin-bottom: 40px;
  }

  .list__title {
    font-size: 72px;
    color: rgba(255, 255, 255, 0.9);
  }

  .list__count {
    font-size: 32px;
  }

  .list__rule {
    height: 2px;
  }

  .list__rows > .row {
    margin-block: 18px;
  }

  .list__more {
    margin-top: 40px;
  }

  .list__more-btn {
    width: 42px;
    height: 42px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .list__more-btn::before {
    transition: none;
  }
}
</style>
