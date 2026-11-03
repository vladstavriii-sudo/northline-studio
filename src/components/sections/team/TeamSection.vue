<template>
  <section id="team" ref="sectionRef" class="team">
    <div class="container team__container">
      <div class="team__header">
        <h2 class="team__title">
          <span class="team__title-line">Everything your business</span>{{ ' ' }}
          <span class="team__title-line">needs, working as one.</span>
        </h2>
        <p class="team__text">
          Strategy, design, development, AI content and campaigns — one team,
          one clear direction.
        </p>
      </div>

      <div ref="contentRef" class="team__content">
        <OptionTags class="team__tags" :tags="options" :rows="MOBILE_ROWS" />

        <div class="team__diagram">
          <div class="team__logo">
            <img
              :src="teamLogo"
              alt=""
              width="113"
              height="113"
              loading="lazy"
              decoding="async"
            />
          </div>

          <TeamArrows class="team__arrows" :fan="fan" />
          <MembersList class="team__members" :members="members" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { gsap } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';

import teamLogo from '@/assets/icons/team-logo.svg';
import OptionTags from './OptionTags.vue';
import MembersList from './MembersList.vue';
import TeamArrows from './TeamArrows.vue';
import { members } from './members.js';
import { options, MOBILE_ROWS } from './options.js';
import { DESKTOP_FAN, NARROW_FAN } from './arrows.data.js';
import { atLeast, useMediaQuery } from '@/composables/useBreakpoints';

const sectionRef = ref(null);
const contentRef = ref(null);
const isWide = useMediaQuery(atLeast('frame'));
const fan = computed(() => (isWide.value ? DESKTOP_FAN : NARROW_FAN));

useScrollScene((section) => {
  const root = contentRef.value;
  const mm = gsap.matchMedia();
  mm.add({ wide: atLeast('frame'), narrow: '(width < 1440px)',
    motion: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
    const tags = [...root.querySelectorAll('.tag')];
    const logo = root.querySelector('.team__logo');
    const wedges = [...root.querySelectorAll('.arrows__wedge')];
    const avatars = [...root.querySelectorAll('.members__item')];
    const active = conditions.wide ? DESKTOP_FAN : NARROW_FAN;
    if (!conditions.motion) {
      gsap.set(root, { '--glow-x': '0px', '--glow-opacity': 1 });
      return;
    }
    // Play the entrance once per mount. Keep its completed state when the
    // user scrolls back above the trigger while the section is still visible.
    const tl = gsap.timeline({ scrollTrigger: {
      trigger: section, start: 'top 75%', end: 'bottom top',
      toggleActions: 'play none none none', once: true,
      onLeave: (self) => self.animation?.progress(1),
    } }).timeScale(1.6);
    const title = section.querySelector('.team__title');
    const copy = section.querySelector('.team__text');
    const rows = [...new Set(tags.map((tag) => tag.offsetTop))].sort((a, b) => a - b);
    const rowOf = new Map(tags.map((tag) => [tag, rows.indexOf(tag.offsetTop)]));
    tl.fromTo(title, { '--reveal': '0%' },
      { '--reveal': '140%', duration: 0.78, ease: 'none' }, 0)
      .fromTo(copy, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.3)
      .fromTo(root, { '--glow-x': '0px', '--glow-opacity': 0 },
        { '--glow-x': '0px', '--glow-opacity': 1, duration: 0.7, ease: 'power1.out' }, 0)
      .fromTo(logo, { autoAlpha: 0, scale: 1.42 },
        { autoAlpha: 1, scale: 1.42, duration: 0.18, ease: 'none' }, 0)
      .to(logo, { scale: 1, duration: 0.24, ease: 'power2.inOut' }, 0.58)
      .fromTo(tags, { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.26,
          stagger: (i, el) => rowOf.get(el) * 0.055, ease: 'power1.out' }, 0.68);
    tl.fromTo(wedges,
      { scale: 0.04, autoAlpha: 0, svgOrigin: `${active.origin.x} ${active.origin.y}` },
      { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 1.12);
    const groups = [
      ['Brand Strategist', 'UI/UX Designer', 'Campaign Manager'],
      ['Web Developer', 'AI Content Producer', 'Product Designer'],
      ['Performance Marketer', 'Project Lead', 'Social Content Manager'],
    ];
    groups.forEach((roles, column) => roles.forEach((role, row) => {
      const avatar = avatars.find((el) => el.dataset.role === role);
      if (avatar) tl.fromTo(avatar, { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'power1.out' },
        1.2 + column * 0.36 + row * 0.1);
    }));
    const pulse = root.querySelector('[data-role="Performance Marketer"] .members__pulse');
    if (pulse) {
      tl.fromTo(pulse, { autoAlpha: 0, scale: 1.02 },
        { autoAlpha: 0.6, scale: 1.08, duration: 0.18, ease: 'none' }, 5.2)
        .to(pulse, { autoAlpha: 0, scale: 1.65, duration: 1.6, ease: 'power1.out' }, 5.38);
    }
  });
  return () => mm.revert();
}, { root: sectionRef });
</script>

<style scoped>
.team {
  padding-block: 150px;
}

.team__header {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 129px;
  text-align: center;
}

.team__title {
  font-weight: 600;
  --reveal: 140%;
  color: var(--blue-100);
}
.team__title-line {
  display: block;
  width: max-content;
  max-width: 100%;
  margin-inline: auto;
  background: linear-gradient(90deg,
    var(--blue-100) calc(var(--reveal) - 30%),
    var(--lime-300) calc(var(--reveal) - 12%),
    #eaffcb var(--reveal));
  background-clip: text;
  -webkit-text-fill-color: transparent;
  mask-image: linear-gradient(90deg,
    #000 calc(var(--reveal) - 8%), transparent var(--reveal));
}

.team__text {
  color: var(--black-900);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
}

.team__content {
  position: relative;
  container-type: inline-size;
  isolation: isolate;
}

.team__diagram {
  --u: 1px;

  position: relative;
}

.team__diagram::before,
.team__diagram::after {
  content: '';
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
  opacity: var(--glow-opacity, 0);
  translate: var(--glow-x, 150px) 0;
}

.team__diagram::before {
  left: calc(69 * var(--u));
  top: calc(94 * var(--u));
  width: calc(770 * var(--u));
  height: calc(291 * var(--u));
  background: linear-gradient(
    90deg,
    rgba(0, 121, 228, 0.2) 0%,
    rgba(0, 121, 228, 0.3) 100%
  );
}

.team__diagram::after {
  left: calc(839 * var(--u));
  top: calc(158 * var(--u));
  width: calc(419 * var(--u));
  height: calc(162 * var(--u));
  background: rgba(0, 121, 228, 0.3);
}

.team__logo,
.team__arrows {
  position: absolute;
}

.team__logo img {
  display: block;
  width: 100%;
  height: auto;
}

@media (width >= 1440px) {
  .team {
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding-block: clamp(64px, 12vh, 180px);
  }
  .team__container {
    width: 70vw;
    max-width: 1800px;
    padding-inline: 0;
  }
  .team__title { font-size: clamp(44px, 3.75vw, 96px); }
  .team__text { font-size: clamp(12px, 0.7vw, 18px); }
  .team__header {
    gap: clamp(16px, 2vw, 32px);
    margin-bottom: clamp(48px, 9vh, 130px);
  }

  .team__diagram,
  .team__tags {
    --u: calc(100cqw / 1440);
  }

  .team__diagram {
    height: calc(476 * var(--u));
  }

  .team__tags {
    --tag-height: calc(53 * var(--u));
    --tag-pad: calc(14 * var(--u)) calc(16 * var(--u));
    --tag-pad-icon: calc(4 * var(--u)) calc(16 * var(--u)) calc(4 * var(--u))
      calc(4 * var(--u));
    --tag-font: calc(19 * var(--u));
    --tag-gap: calc(10 * var(--u));
    --tag-icon-w: calc(74 * var(--u));
    --tag-icon-h: calc(45 * var(--u));
    --tag-icon-radius: calc(5 * var(--u));

    position: absolute;
    left: 0;
    top: calc(56 * var(--u));
    width: calc(726 * var(--u));
  }

  .team__logo {
    left: calc(781 * var(--u));
    top: calc(183 * var(--u));
    width: calc(113 * var(--u));
  }

  .team__arrows {
    left: calc(892 * var(--u));
    top: calc(74 * var(--u));
    width: calc(505 * var(--u));
    height: calc(347 * var(--u));
  }
}

@media (width < 1440px) {
  .team__header {
    margin-bottom: 64px;
  }

  .team__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .team__content,
  .team__diagram {
    --u: clamp(0.72px, 100cqw / 358, 1.2px);
  }

  .team__diagram {
    --narrow-top: 248;

    width: calc(358 * var(--u));
    height: calc(430 * var(--u));
    margin-top: calc(24 * var(--u));
  }

  .team__diagram::before {
    left: calc(63 * var(--u));
    top: auto;
    bottom: calc(100% - 42 * var(--u));
    width: calc(241 * var(--u));
    height: calc(290 * var(--u));
    background: linear-gradient(
      180deg,
      rgba(0, 121, 228, 0.2) 0%,
      rgba(0, 121, 228, 0.3) 100%
    );
    translate: 0 0;
  }

  .team__diagram::after {
    left: calc(135 * var(--u));
    top: calc(68 * var(--u));
    width: calc(98 * var(--u));
    height: calc(252 * var(--u));
    translate: 0 0;
  }

  .team__tags {
    max-width: calc(480 * var(--u));
  }

  .team__logo {
    left: calc(144 * var(--u));
    top: calc(32 * var(--u));
    width: calc(70 * var(--u));
  }

  .team__arrows {
    left: calc(95.2 * var(--u));
    top: calc(95 * var(--u));
    width: calc(167.61 * var(--u));
    height: calc(273 * var(--u));
  }
}

@media (width < 1024px) {
  .team {
    padding-block: 100px;
  }
}

@media (width < 768px) {
  .team__text {
    display: none;
  }
}
@media (width < 768px) {
  .team__title { font-size: clamp(30px, 8.1vw, 36px); line-height: 1.08; text-wrap: balance; }
  .team__title-line { display: inline; width: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .team__title-line {
    background: none;
    mask-image: none;
    -webkit-text-fill-color: currentColor;
  }
}
</style>
