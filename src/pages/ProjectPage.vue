<template>
  <div class="case-shell">
    <Header pinned project-exit />

    <main ref="rootRef" class="case">
      <div class="case__stage">
        <header class="case__head container">
          <h1 class="case__title">{{ project.title }}</h1>

          <dl class="case__meta">
            <div class="case__meta-item">
              <dt>Screening date:</dt>
              <dd>{{ page.screeningDate }}</dd>
            </div>
            <div class="case__meta-item">
              <dt>Type:</dt>
              <dd>{{ page.type }}</dd>
            </div>
            <div class="case__meta-item">
              <dt>Focus:</dt>
              <dd>{{ page.focus }}</dd>
            </div>
          </dl>

          <div class="case__aside">
            <p class="case__index">({{ page.index }})</p>
          </div>
        </header>

        <div ref="trackRef" class="case__track">
          <template v-for="(panel, i) in page.panels" :key="i">
            <div class="case__panel case__panel--media">
              <video
                v-if="isVideoAsset(panel.media)"
                class="case__media"
                :src="panel.media"
                muted
                loop
                playsinline
                preload="metadata"
              ></video>
              <img
                v-else-if="panel.media"
                class="case__media"
                :src="panel.media"
                :alt="`${project.title} — ${i + 1}`"
                decoding="async"
              />
            </div>

            <div v-if="panel.text" class="case__panel case__panel--note">
              <p class="case__marker">//{{ noteNumber(i) }}</p>
              <p class="case__text">{{ panel.text }}</p>
            </div>
          </template>

          <ProjectNext
            class="case__panel"
            :project="nextProject"
            :marker="nextMarker"
          />
        </div>

        <footer class="case__bar container">
          <div class="case__tools">
            <p><span>AI tools</span> {{ page.aiTools }}</p>
            <p><span>Design tools</span> {{ page.designTools }}</p>
          </div>
          <p class="case__hint">
            <span class="case__hint-wide">keep scrolling</span>
            <span class="case__hint-narrow">swipe right</span>
          </p>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { gsap } from '@/composables/useGsap';
import { useScrollScene } from '@/composables/useScrollScene';
import { createHorizontalScrub } from '@/composables/useHorizontalScrub';
import { createVideoGate } from '@/composables/useVideoAutoplay';
import {
  CASE_STUDIES,
  PLACEHOLDER_PAGE,
  PLACEHOLDER_PROJECT,
  findProject,
  isVideoAsset,
} from '@/content/projects.data.js';
import ProjectNext from '@/components/projects/ProjectNext.vue';
import { usePixelChrome } from '@/composables/usePixelChrome';
import { useSeo } from '@/composables/useSeo';
import { PLACEHOLDER_SEO } from '@/seo/site.js';
import { atLeast } from '@/composables/useBreakpoints';
import Header from '@/components/header/Header.vue';

const route = useRoute();

const project = computed(
  () => findProject(String(route.params.slug)) ?? PLACEHOLDER_PROJECT,
);
const page = computed(() => project.value.page ?? {
  ...PLACEHOLDER_PAGE,
  index: project.value.index ?? PLACEHOLDER_PAGE.index,
});

useSeo(() => {
  if (!project.value.page) return PLACEHOLDER_SEO;

  const intro = page.value.panels.find((panel) => panel.text)?.text ?? '';

  return {
    title: `${project.value.title} — ${page.value.type} | Northline studio`,
    description: intro.slice(0, 200).trim(),
    type: 'article',
  };
});

const trackRef = ref(null);

const { setPixelChrome } = usePixelChrome();
onMounted(() => setPixelChrome(true));
onBeforeUnmount(() => setPixelChrome(false));

const nextProject = computed(() => {
  const at = CASE_STUDIES.findIndex((item) => item.slug === project.value.slug);
  return CASE_STUDIES[(at + 1) % CASE_STUDIES.length];
});

const nextMarker = computed(
  () => page.value.panels.filter((panel) => panel.text).length + 1,
);

function noteNumber(index) {
  return page.value.panels.slice(0, index + 1).filter((p) => p.text).length;
}

const rootRef = useScrollScene((root) => {
  const track = trackRef.value;
  if (!track) return;

  const mediaGate = createVideoGate();
  mediaGate.observe(root.querySelectorAll('.case__panel--media video'));

  const mm = gsap.matchMedia();

  mm.add(
    `${atLeast('tablet')} and (prefers-reduced-motion: no-preference)`,
    () => {
      createHorizontalScrub(root, track);
    },
  );

  return () => {
    mediaGate.disconnect();
    mm.revert();
  };
});
</script>

<style scoped>
.case-shell {
  --archive-screen: var(--archive-navy);
}

.case {
  background: var(--archive-navy);
  color: var(--white);
}

.case__stage {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100dvh;
  padding-top: calc(var(--header-height) + 34px);
}

.case__head {
  display: flex;
  align-items: last baseline;
  justify-content: space-between;
  gap: 32px;
  flex-shrink: 0;
  padding-block: 18px 20px;
}

.case__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 8.3vw, 120px);
  font-weight: 400;
  line-height: 1;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
}

.case__meta {
  display: flex;
  gap: clamp(20px, 3vw, 60px);
  margin: 0 0 0 auto;
}

.case__meta-item dt,
.case__meta-item dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.2;
  white-space: nowrap;
}

.case__meta-item dt {
  color: var(--white);
  text-transform: uppercase;
}

.case__meta-item dd {
  color: var(--archive-lav);
}

.case__aside {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.4vw, 20px);
  flex-shrink: 0;
  align-self: auto;
}

.case__index {
  margin: 0;
  color: var(--archive-lav);
  font-family: var(--font-display);
  font-size: clamp(26px, 3.3vw, 48px);
  line-height: 1;
}

.case__track {
  display: flex;
  align-items: stretch;
  flex: 1;
  width: max-content;
  min-height: 0;
  padding-left: var(--container-gutter);
}

.case__panel {
  flex: 0 0 auto;
  height: 100%;
  aspect-ratio: 1;
}

.case__panel--media {
  background: #d9d9d9;
}

.case__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case__panel--note {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 22px clamp(20px, 2.4vw, 44px);
  background: var(--case-note);
}

.case__marker {
  margin: 0;
  color: var(--white);
  font-family: var(--font-display);
  font-size: clamp(18px, 1.9vw, 28px);
  line-height: 1;
}

.case__text {
  margin: 0;
  color: var(--white);
  font-family: var(--font-display);
  font-size: clamp(16px, 1.9vw, 28px);
  line-height: 1.25;
}

.case__bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-shrink: 0;
  padding-block: 14px 18px;
}

.case__tools {
  display: flex;
  align-items: baseline;
  gap: clamp(16px, 2vw, 32px);
}

.case__tools p {
  margin: 0;
  color: var(--archive-lav);
  font-family: var(--font-display);
  font-size: clamp(11px, 1vw, 14px);
  line-height: 1.5;
  text-transform: uppercase;
  white-space: nowrap;
}

.case__tools span {
  display: block;
  color: var(--white);
}

.case__hint {
  margin: 0;
  color: var(--white);
  font-family: var(--font-display);
  font-size: clamp(13px, 1.25vw, 18px);
  text-transform: uppercase;
}

.case__hint-narrow {
  display: none;
}

@media (width < 1024px) {
  .case__stage {
    height: 100dvh;
    padding-top: calc(var(--header-height) + 24px);
  }

  .case__head {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    padding-block: 10px 14px;
  }

  .case__title {
    font-size: clamp(36px, 9vw, 72px);
  }

  .case__meta {
    order: 3;
    flex-basis: 100%;
    gap: 10px 22px;
    margin: 0;
  }

  .case__meta-item dt,
  .case__meta-item dd {
    font-size: 13px;
  }

  .case__track {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    width: 100%;
    transform: none !important;
    scrollbar-width: none;
  }

  .case__track::-webkit-scrollbar {
    display: none;
  }

  .case__panel {
    flex: 0 0 88%;
    width: 88%;
    height: 100%;
    aspect-ratio: auto;
  }

  .case__panel--note {
    justify-content: flex-end;
    gap: 14px;
    padding: 24px var(--container-padding-mobile);
  }

  .case__text {
    font-size: 18px;
  }

  .case__bar {
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 10px;
    padding-block: 12px 16px;
  }

  .case__hint {
    align-self: center;
  }

  .case__tools {
    flex-wrap: wrap;
    gap: 4px 16px;
  }

  .case__tools p {
    white-space: normal;
  }

  .case__hint-wide {
    display: none;
  }

  .case__hint-narrow {
    display: inline;
  }
}

@media (prefers-reduced-motion: reduce) {
  .case__stage {
    height: auto;
    overflow: visible;
  }

  .case__track {
    flex-direction: column;
    width: 100%;
  }

  .case__panel {
    width: 100%;
    height: auto;
  }
}
</style>
