import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ScrollTrigger } from '@/composables/useGsap';
import { useLoader } from '@/composables/useLoader';
import {
  coverPage,
  revealPage,
  usePixelTransition,
} from '@/composables/usePixelTransition';
import { anchorTop, nextFrame, scrollToY } from '@/utils/scroll';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/project/:slug',
    name: 'project',
    component: () => import('@/pages/ProjectPage.vue'),
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/pages/LegalPage.vue'),
  },
  {
    path: '/privacy-policy',
    name: 'privacy',
    component: () => import('@/pages/LegalPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

const SETTLE_MS = 8000;
const SETTLE_STEP_MS = 16;

const { isLoading } = useLoader();
const { isCovered } = usePixelTransition();

let settleTimer = 0;

let settleDone = null;
let scrollSettled = Promise.resolve();

function scrollWhenSettled(measure, immediate = false) {
  clearTimeout(settleTimer);
  settleDone?.();

  const startedAt = performance.now();
  let previous = null;
  let stable = 0;

  scrollSettled = new Promise((resolve) => {
    settleDone = resolve;
  });

  const finish = () => {
    settleDone?.();
    settleDone = null;
  };

  const step = () => {
    const expired = performance.now() - startedAt > SETTLE_MS;
    const top = isLoading.value ? null : measure(expired);

    if (top !== null) {
      stable = top === previous ? stable + 1 : 0;
      previous = top;

      if (stable >= 2 || expired) {
        scrollToY(top, { immediate });
        return finish();
      }
    } else if (expired) {
      return finish();
    }

    settleTimer = setTimeout(step, SETTLE_STEP_MS);
  };

  settleTimer = setTimeout(step, 0);
}

function scrollToHash(hash, immediate = false) {
  scrollWhenSettled(() => {
    const el = document.querySelector(hash);
    return el ? anchorTop(el) : null;
  }, immediate);
}

function scrollToSaved(top) {
  scrollWhenSettled(() => {
    const max = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    return max >= top ? top : null;
  }, true);
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      scrollToHash(to.hash, isCovered.value);
      return false;
    }

    if (savedPosition) {
      scrollToSaved(savedPosition.top);
      return false;
    }

    scrollSettled = Promise.resolve();
    scrollToY(0, { immediate: true });
    return false;
  },
});

function isArchiveHop(to, from) {
  if (!from.matched.length || to.path === from.path) return false;
  return to.name === 'project' || from.name === 'project';
}

router.beforeEach(async (to, from) => {
  ScrollTrigger.clearScrollMemory('manual');
  if (isArchiveHop(to, from)) await coverPage();
  return true;
});

router.afterEach(async () => {
  if (!isCovered.value) return;
  await nextTick();
  await nextFrame();
  await scrollSettled;
  await nextFrame();
  revealPage();
});

export default router;
