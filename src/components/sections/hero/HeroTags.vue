<template>
  <ul
    ref="listRef"
    class="hero-tags"
    :class="{ 'hero-tags--in': revealed }"
    aria-label="What we do"
  >
    <li
      v-for="tag in TAGS"
      :key="tag.label"
      class="hero-tags__slot"
      :style="{
        left: tag.left,
        right: tag.right,
        top: tag.top,
        '--tag-rotate': `${tag.rotate}deg`,
        '--tag-step': tag.step,
      }"
    >
      <AppTag
        class="hero-tags__tag"
        :variant="tag.variant"
        :label="tag.label"
        outlined
      />
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue';
import AppTag from '@/components/ui/AppTag.vue';
import { useMagneticEffect } from '@/composables/useMagneticEffect';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

defineProps({
  revealed: { type: Boolean, default: false },
});

const listRef = ref(null);

if (!prefersReducedMotion()) {
  useMagneticEffect(() => listRef.value?.children ?? [], {
    strength: 10,
    duration: 0.5,
  });
}

const TAGS = [
  {
    label: 'Advertising',
    variant: 'navy',
    left: '73.9%',
    top: '49.4%',
    rotate: -4.2,
    step: 1,
  },
  {
    label: 'Branding',
    variant: 'orange',
    left: '63.5%',
    top: '84.9%',
    rotate: 2.8,
    step: 2,
  },
  {
    label: 'UI Design',
    variant: 'magenta',
    right: '-0.4%',
    top: '84.5%',
    rotate: 6,
    step: 3,
  },
  {
    label: 'AI Video',
    variant: 'lime',
    left: '55.5%',
    top: '50%',
    rotate: -12,
    step: 0,
  },
];
</script>

<style scoped>
.hero-tags {
  font-size: var(--heading-h1);
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.hero-tags__slot {
  position: absolute;
  opacity: 0;
  pointer-events: auto;
  will-change: transform;
}

.hero-tags--in .hero-tags__slot {
  animation: hero-tag-land 0.44s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(var(--tag-step, 0) * 0.14s);
}

@keyframes hero-tag-land {
  from {
    opacity: 0;
    translate: 0 8px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes hero-tag-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-tags--in .hero-tags__slot {
    animation-name: hero-tag-fade;
    animation-timing-function: ease;
  }
}

.hero-tags__tag {
  --tag-font: clamp(10px, 0.152em, 14px);
  --tag-line: 1.72;
  --tag-pad: 0.36em 1em;
  --tag-height: auto;

  transform: rotate(var(--tag-rotate, 0deg));
  white-space: nowrap;
}

@media (width < 1440px) {
  .hero-tags {
    display: none;
  }
}
</style>
