import { getLenis } from '@/composables/useLenis';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

export const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

export function anchorTop(el) {
  const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.round(el.getBoundingClientRect().top + window.scrollY - offset);
}

export function scrollToY(
  top,
  { immediate = false, force = false, duration } = {},
) {
  const y = Math.max(0, top);
  const lenis = getLenis();

  if (lenis) {
    lenis.resize();
    lenis.scrollTo(y, { immediate, force, duration });
    return;
  }

  const instant = immediate || prefersReducedMotion();
  window.scrollTo({ top: y, behavior: instant ? 'instant' : 'smooth' });
}

const SETTLE_FRAMES = 30;

export async function settleOn(el) {
  let stable = 0;

  for (let frame = 0; el && frame < SETTLE_FRAMES && stable < 2; frame += 1) {
    const top = anchorTop(el);

    if (Math.abs(window.scrollY - top) > 1) {
      stable = 0;
      scrollToY(top, { immediate: true, force: true });
    } else {
      stable += 1;
    }

    await nextFrame();
  }
}

const QUIET_MS = 200;
const QUIET_MAX_MS = 1500;

export function freezeScroll() {
  const lenis = getLenis();
  const wasRunning = lenis ? !lenis.isStopped : false;
  let lastInput = performance.now();

  const block = (event) => {
    lastInput = performance.now();
    event.preventDefault();
  };

  lenis?.stop();
  window.addEventListener('wheel', block, { passive: false });
  window.addEventListener('touchmove', block, { passive: false });

  return async () => {
    const startedAt = performance.now();
    while (
      performance.now() - lastInput < QUIET_MS &&
      performance.now() - startedAt < QUIET_MAX_MS
    ) {
      await nextFrame();
    }

    window.removeEventListener('wheel', block);
    window.removeEventListener('touchmove', block);
    if (wasRunning) lenis.start();
  };
}
