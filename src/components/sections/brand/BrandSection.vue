<template>
  <section id="brand" ref="brandSection" class="brand">
    <div class="container">
      <div class="brand__wrapper">
        <p class="brand__text">
          <span class="brand__sr">{{ BRAND_TEXT }}</span>
          <span
            v-for="layout in layouts"
            :key="layout.name"
            class="brand__lines"
            :class="`brand__lines--${layout.name}`"
            aria-hidden="true"
          >
            <span
              v-for="(line, index) in layout.lines"
              :key="index"
              class="brand__line"
              :class="{
                'brand__line--lead': line.icon && !line.before.length,
              }"
              :style="line.icon ? { '--gap': `${line.icon.gap}em` } : null"
            >
              <span
                v-if="line.before.length"
                class="brand__part brand__part--before"
                ><span
                  v-for="(word, i) in line.before"
                  :key="i"
                  class="brand__word"
                  >{{ word }}</span
                ></span
              >
              <span v-if="line.icon" class="brand__slot">
                <span
                  class="brand__icon"
                  :style="{
                    '--size': `${line.icon.size}em`,
                    '--rotate': `${line.icon.rotate}deg`,
                  }"
                >
                  <img
                    :src="line.icon.src"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </span>
              <span
                class="brand__part"
                :class="line.icon ? 'brand__part--after' : 'brand__part--plain'"
                ><span
                  v-for="(word, i) in line.after"
                  :key="i"
                  class="brand__word"
                  >{{ word }}</span
                ></span
              >
            </span>
          </span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { gsap } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import { atLeast, below } from '@/composables/useBreakpoints';
import { BRAND_LAYOUTS, BRAND_TEXT } from './brand.data.js';

const toWords = (text) =>
  text
    .split(' ')
    .filter(Boolean)
    .map((word, i, all) => (i < all.length - 1 ? `${word} ` : word));

const layouts = Object.entries(BRAND_LAYOUTS).map(([name, lines]) => ({
  name,
  lines: lines.map((line) => ({
    ...line,
    before: toWords(line.before),
    after: toWords(line.after),
  })),
}));

const brandSection = useScrollScene((root) => {
  if (prefersReducedMotion()) return;

  const saturated = getComputedStyle(root).getPropertyValue('--blue-100');
  const mm = gsap.matchMedia();

  const build = (layout) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=2000',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    const paint = (words) => {
      if (!words.length) return;
      tl.to(words, {
        color: saturated,
        duration: 0.25,
        stagger: 0.12,
        ease: 'none',
      });
    };

    layout.querySelectorAll('.brand__line').forEach((line) => {
      paint(line.querySelectorAll('.brand__part--before .brand__word'));

      const img = line.querySelector('.brand__icon img');
      if (img) {
        tl.to(line, { '--spread': 1, duration: 0.5, ease: 'power2.inOut' }).to(
          img,
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
        );
      }

      paint(
        line.querySelectorAll(
          '.brand__part--after .brand__word, .brand__part--plain .brand__word',
        ),
      );
    });
  };

  mm.add(atLeast('mobile'), () =>
    build(root.querySelector('.brand__lines--desktop')),
  );
  mm.add(below('mobile'), () =>
    build(root.querySelector('.brand__lines--mobile')),
  );

  return () => mm.revert();
});
</script>

<style scoped>
.brand {
  position: relative;
  z-index: 1;
  background: var(--white);
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100svh;
  padding-block: var(--anchor-offset) 48px;
  overflow: hidden;
}

.brand > .container {
  width: 100%;
}

.brand__wrapper {
  container-type: inline-size;
}

.brand__text {
  --lines: 7;
  --leading: 1.6;
  --widest: 19;
  --fluid: calc(66 / 1920 * 100vw);

  font-size: min(
    var(--fluid),
    100cqi / var(--widest),
    (100svh - var(--anchor-offset) - 96px) / (var(--lines) * var(--leading))
  );
  font-weight: 700;
  line-height: var(--leading);
  color: var(--blue-600);
}

.brand__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.brand__lines {
  display: block;
}

.brand__lines--mobile {
  display: none;
}

.brand__line {
  --spread: 0;
  --pull-before: calc((var(--gap) - 0.3125em) / 2);
  --pull-after: var(--pull-before);

  display: flex;
  justify-content: center;
  white-space: nowrap;
}

.brand__line--lead {
  --pull-after: calc(var(--gap) / 2);
}

.brand__part {
  white-space: pre;
}

.brand__part--before {
  transform: translateX(calc(var(--pull-before) * (1 - var(--spread))));
}

.brand__part--after {
  transform: translateX(calc(var(--pull-after) * (var(--spread) - 1)));
}

.brand__slot {
  position: relative;
  flex: none;
  width: var(--gap);
}

.brand__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  transform: translate(-50%, -50%) rotate(var(--rotate));
  pointer-events: none;
}

.brand__icon img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0);
}

@media (width < 768px) {
  .brand {
    padding-block: 64px;
  }

  .brand__text {
    --lines: 10;
    --leading: 1.9;
    --widest: 13.77;
    --fluid: calc(26 / 390 * 100vw);
  }

  .brand__lines--desktop {
    display: none;
  }

  .brand__lines--mobile {
    display: block;
  }

  .brand__line {
    --pull-before: 0px;
    --pull-after: calc(var(--gap) - 0.3125em);

    justify-content: flex-start;
  }

  .brand__line--lead {
    --pull-after: var(--gap);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand__line {
    --spread: 1;
  }

  .brand__word {
    color: var(--blue-100);
  }

  .brand__icon img {
    opacity: 1;
    transform: none;
  }
}
</style>
