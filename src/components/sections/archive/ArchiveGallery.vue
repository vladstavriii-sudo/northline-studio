<template>
  <div ref="galleryRef" class="gallery" :style="{ '--gallery-h': height }">
    <div class="gallery__stage">
      <div class="gallery__title">
        <slot :count="padIndex(entries.length)" />
      </div>
    </div>

    <ul class="gallery__cards">
      <li
        v-for="(project, i) in entries"
        :key="`${project.slug}-${i}`"
        class="gallery__item"
        :style="{ '--x': slots[i].x, '--y': slots[i].y }"
      >
        <RouterLink
          :to="{ name: 'project', params: { slug: project.slug } }"
          class="card"
          @mouseenter="active = i"
          @mouseleave="active = -1"
          @focusin="active = i"
          @focusout="active = -1"
        >
          <span class="card__index">({{ project.index }})</span>
          <span class="card__cover">
            <ProjectThumb
              :still="project.thumb"
              :video="project.thumbVideo"
              :active="active === i"
            />
          </span>
          <span class="card__meta">
            <span class="card__title">{{ project.title }}</span>
            <span class="card__arrow mask-icon" aria-hidden="true"></span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProjectThumb from '@/components/projects/ProjectThumb.vue';
import { padIndex } from '@/content/projects.data.js';

const props = defineProps({
  projects: { type: Array, required: true },
});

const SLOTS = [
  [243, 0],
  [1095, 200],
  [0, 599],
  [608, 799],
  [973, 1300],
  [243, 1400],
  [730, 1911],
  [122, 2051],
];
const PERIOD = 2573;
const CARD = 397;

const active = ref(-1);

// Alternate projects through their different views, then the future case slots.
const entries = computed(() => {
  const cases = props.projects.filter((project) => project.page);
  const future = props.projects.filter((project) => !project.page);
  const rounds = Math.max(0, ...cases.map((project) => project.gallery.length));
  return Array.from({ length: rounds }, (_, round) => cases
    .filter((project) => project.gallery[round])
    .map((project) => ({ ...project, thumb: project.gallery[round], thumbVideo: '' })))
    .flat().concat(future);
});

const slots = computed(() =>
  entries.value.map((_, i) => {
    const [x, y] = SLOTS[i % SLOTS.length];
    return { x, y: y + Math.floor(i / SLOTS.length) * PERIOD };
  }),
);

const height = computed(() =>
  Math.max(0, ...slots.value.map(({ y }) => y + CARD)),
);
const galleryRef = ref(null);
</script>

<style scoped>
.gallery {
  --u: calc(100cqw / 1440);
  --card: calc(345 * var(--u));
  --card-font: max(18px, calc(28 * var(--u)));

  position: relative;
  height: calc(var(--gallery-h) * var(--u));
}

.gallery__stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gallery__title {
  position: sticky;
  top: 50%;
  translate: 0 -50%;
  display: flex;
  justify-content: center;
}

.gallery__cards {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gallery__item {
  position: absolute;
  top: calc(var(--y) * var(--u));
  left: calc(var(--x) * var(--u));
  width: var(--card);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(10 * var(--u));
  color: var(--white);
  font-family: var(--font-display);
  font-size: var(--card-font);
  line-height: 1;
  text-decoration: none;
}

.card__cover {
  display: block;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1;
}

.card__cover :deep(.thumb__media) {
  transition: scale 0.6s var(--transition-timing);
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.card__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card__arrow {
  flex: none;
  width: calc(var(--card-font) * 34 / 28);
  height: calc(var(--card-font) * 16 / 28);
  --mask-src: url('@/assets/icons/archive/arrow-card.svg');
  background-color: var(--white);
  transition: translate 0.45s var(--transition-timing);
}

.card:hover .card__cover :deep(.thumb__media),
.card:focus-visible .card__cover :deep(.thumb__media) {
  scale: 1.04;
}

.card:hover .card__arrow,
.card:focus-visible .card__arrow {
  translate: 8px 0;
}

.card:focus-visible {
  outline: 2px solid var(--pixel-orange);
  outline-offset: 6px;
}

@media (width < 1024px) {
  .gallery {
    --card-font: 18px;

    height: auto;
  }

  .gallery__cards {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 9cqw;
    row-gap: 72px;
    padding-bottom: 20cqw;
  }

  .gallery__item {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
  }

  .gallery__item:nth-child(even) {
    translate: 0 20cqw;
  }

  .card {
    gap: 10px;
  }
}

@media (width < 768px) {
  .gallery {
    --card-font: 16px;
  }

  .gallery__cards {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 56px;
    padding-bottom: 0;
  }

  .gallery__item {
    width: 72%;
  }

  .gallery__item:nth-child(even) {
    justify-self: end;
    translate: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card__cover :deep(.thumb__media),
  .card__arrow {
    transition: none;
  }
}
</style>
