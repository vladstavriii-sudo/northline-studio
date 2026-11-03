<template>
  <section id="services" ref="sectionRef" class="services">
    <div class="container">
      <p class="services__label">What we create</p>

      <div class="services__titles">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          :ref="(el) => setTitleRef(el, index)"
          class="services__title"
          :class="{ 'is-active': activeIndex === index }"
          :style="{ color: item.color }"
        >
          <span
            v-for="line in item.title"
            :key="line"
            class="services__title-line"
          >
            {{ line }}
          </span>

          <div class="services__images" aria-hidden="true">
            <img
              v-for="image in item.images"
              :key="image.src"
              :src="image.src"
              :style="imageStyle(image)"
              class="services__image"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watchEffect, onBeforeUnmount } from 'vue';

import { ScrollTrigger } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { SERVICES as items } from './services.data';

const titleRefs = ref([]);
const activeIndex = ref(0);
const inView = ref(false);

const activeItem = computed(() => items[activeIndex.value]);

const setPageBackground = (color) => {
  const { style } = document.documentElement;
  if (color) {
    style.setProperty('--page-bg', color);
    style.setProperty('--services-preview-blend', 'multiply');
  } else {
    style.removeProperty('--page-bg');
    style.removeProperty('--services-preview-blend');
  }
};

watchEffect(() => {
  setPageBackground(inView.value ? activeItem.value.background : null);
});

onBeforeUnmount(() => setPageBackground(null));

const imageStyle = ({ x, y, size, ratio = 1, rotate = 0 }) => ({
  '--x': `${x}%`,
  '--y': `${y}%`,
  '--size': `${size}%`,
  '--ratio': ratio,
  '--rotate': `${rotate}deg`,
});

const setTitleRef = (el, index) => {
  titleRefs.value[index] = el;
};

const updateActiveIndex = () => {
  const viewportCenter = window.innerHeight / 2;

  let nextIndex = activeIndex.value;
  let minDistance = Infinity;

  titleRefs.value.forEach((el, index) => {
    if (!el) return;

    const { top, height } = el.getBoundingClientRect();
    const distance = Math.abs(top + height / 2 - viewportCenter);

    if (distance < minDistance) {
      minDistance = distance;
      nextIndex = index;
    }
  });

  if (nextIndex !== activeIndex.value) {
    activeIndex.value = nextIndex;
  }
};

const sectionRef = useScrollScene((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: updateActiveIndex,
    onRefresh: updateActiveIndex,
  });

  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    end: 'bottom top',
    onToggle: (self) => {
      inView.value = self.isActive;
    },
  });

  updateActiveIndex();

  return () => {
    titleRefs.value = [];
  };
});
</script>

<style scoped>
.services {
  --services-title-size: clamp(44px, 19.02px + 6.4vw, 142px);
  --services-title-pad: clamp(16px, 11.92px + 1.05vw, 32px);
  --services-gap: clamp(16px, 3.76px + 3.14vw, 64px);
  --services-label-size: clamp(16px, 14.47px + 0.39vw, 22px);
  --services-image-scale: 1.25;

  position: relative;
  padding-top: clamp(100px, 94.65px + 1.37vw, 121px);
  padding-bottom: clamp(100px, 87.25px + 3.27vw, 150px);
}

.services__label {
  font-family: var(--font-mono);
  font-size: var(--services-label-size);
  font-weight: 500;
  text-align: center;
  margin-bottom: calc(32px - var(--services-title-pad));
}

.services__titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: var(--services-gap);
  text-align: center;
}

.services__title {
  position: relative;
  width: 100%;
  padding-block: var(--services-title-pad);
  font-size: var(--services-title-size);
  font-weight: 700;
  line-height: 0.9;
  opacity: 0.35;
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.services__title.is-active {
  opacity: 1;
}

.services__title.is-active .services__images {
  opacity: 1;
}

.services__title-line {
  display: block;
}

.services__images {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.services__image {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: calc(var(--size) * var(--services-image-scale));
  height: auto;
  aspect-ratio: var(--ratio, 1);
  translate: -50% -50%;
  rotate: var(--rotate, 0deg);
  object-fit: contain;
}

@media (width < 768px) {
  .services { --services-title-size: clamp(36px, 10.6vw, 46px); }
  .services__title { font-weight: 600; }
}

@media (prefers-reduced-motion: reduce) {
  .services__title,
  .services__images {
    transition: none;
  }
}
</style>
