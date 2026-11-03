<template>
  <RouterLink
    :to="{ name: 'project', params: { slug: project.slug } }"
    class="row row--link"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="hovered = true"
    @focusout="hovered = false"
  >
    <span
      v-for="cell in layout.cells"
      :key="cell.idle"
      class="row__cell"
      :class="`row__cell--${cell.y}`"
      :style="{
        left: cell.x,
        '--narrow-col': cell.narrowCol,
        '--narrow-row': cell.narrowRow,
      }"
    >
      <span class="row__swap">
        <span class="row__line">{{ field(cell.idle) }}</span>
        <span class="row__line" aria-hidden="true">{{
          field(cell.hover)
        }}</span>
      </span>
    </span>

    <span
      class="row__cover"
      :style="{ '--cover-x': layout.cover, '--narrow-col': layout.narrowCover }"
    >
      <ProjectThumb
        class="row__thumb"
        :still="project.thumb"
        :video="project.thumbVideo"
        :active="hovered"
      />
    </span>

    <span
      class="row__arrow mask-icon"
      :style="{ '--narrow-col': layout.narrowArrow }"
      aria-hidden="true"
    ></span>
  </RouterLink>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProjectThumb from '@/components/projects/ProjectThumb.vue';
import { padIndex } from '@/content/projects.data.js';

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, required: true },
  layout: { type: Object, required: true },
});

const hovered = ref(false);

function field(name) {
  if (name === 'title') return `Title: ${props.project.title}`;
  if (name === 'focus') return `Focus: ${props.project.focus}`;
  if (name === 'date') return `Date: ${props.project.date}`;
  return padIndex(props.index + 1);
}
</script>

<style scoped>
.row {
  position: relative;
  display: block;
  height: var(--row-h, 179px);
  color: var(--archive-lav);
  font-family: var(--font-display);
  font-size: var(--row-font, 22px);
  line-height: 1;
  text-decoration: none;
  transition: color 0.35s var(--transition-timing);
}

.row--link:hover,
.row--link:focus-visible {
  color: var(--white);
}

.row__cell {
  position: absolute;
  display: block;
  overflow: hidden;
  height: 1.4em;
  white-space: nowrap;
}

.row__cell--top {
  top: 0;
}

.row__cell--bottom {
  bottom: 0;
}

.row__swap {
  display: block;
  transition: translate 0.45s var(--transition-timing);
}

.row__line {
  display: block;
  height: 1.4em;
  line-height: 1.4;
}

.row--link:hover .row__swap,
.row--link:focus-visible .row__swap {
  translate: 0 -1.4em;
}

.row__cover {
  position: absolute;
  top: 0;
  left: max(var(--cover-x), calc(var(--row-h, 179px) * 7 / 18));
  display: block;
  overflow: hidden;
  width: var(--row-h, 179px);
  height: 100%;
  transition:
    width 0.45s var(--transition-timing),
    translate 0.45s var(--transition-timing);
}

.row--link:hover .row__cover,
.row--link:focus-visible .row__cover {
  width: calc(var(--row-h, 179px) * 16 / 9);
  translate: calc(var(--row-h, 179px) * -7 / 18) 0;
}

.row__thumb {
  width: 100%;
  height: 100%;
  filter: brightness(0.78) saturate(0.8);
  transition: filter 0.45s var(--transition-timing);
}

.row--link:hover .row__thumb,
.row--link:focus-visible .row__thumb {
  filter: none;
}

.row__arrow {
  position: absolute;
  top: 50%;
  right: 0;
  translate: 0 -50%;
  width: 42px;
  height: 20px;
  --mask-src: url('@/assets/icons/archive/arrow.svg');
  background-color: var(--archive-lav);
  transition:
    translate 0.45s var(--transition-timing),
    background-color 0.35s var(--transition-timing);
}

.row--link:hover .row__arrow,
.row--link:focus-visible .row__arrow {
  translate: 14px -50%;
  background-color: var(--white);
}

.row:focus-visible {
  outline: 2px solid var(--pixel-orange);
  outline-offset: 6px;
}

@media (width < 1024px) {
  .row {
    --row-h: 132px;
    --row-font: 18px;
  }

  .row__arrow {
    width: 32px;
    height: 15px;
  }
}

@media (width < 768px) {
  .row {
    --row-h: 111px;
    --row-font: 16px;

    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--row-h) minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
    gap: 0 24px;
    color: var(--white);
  }

  .row__cell {
    position: static;
    grid-column: var(--narrow-col);
    grid-row: var(--narrow-row);
    width: 100%;
  }

  .row__line {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row__cover {
    position: static;
    grid-column: var(--narrow-col);
    grid-row: 1 / -1;
    width: 100%;
    height: 100%;
  }

  .row--link:hover .row__cover,
  .row--link:focus-visible .row__cover {
    width: 100%;
    translate: none;
  }

  .row__arrow {
    position: static;
    grid-column: var(--narrow-col);
    grid-row: 2;
    justify-self: end;
    align-self: center;
    width: 42px;
    height: 20px;
    translate: none;
  }

  .row--link:hover .row__arrow,
  .row--link:focus-visible .row__arrow {
    translate: 8px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .row__swap,
  .row__cover,
  .row__thumb,
  .row__arrow {
    transition: none;
  }
}
</style>
