import { ref } from 'vue';
import heroBgUrl from '@/assets/images/hero-bg.webp';

const progress = ref(0);
const isLoading = ref(true);
const isGone = ref(false);

const markGone = () => {
  isGone.value = true;
};

let started = false;

const MIN_MS = 500;
const MAX_MS = 7000;

function run() {
  const start = performance.now();

  const heroBg = new Image();
  heroBg.src = heroBgUrl;

  const signals = [
    document.fonts ? document.fonts.ready : Promise.resolve(),
    heroBg.decode ? heroBg.decode().catch(() => {}) : Promise.resolve(),
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((res) =>
          window.addEventListener('load', res, { once: true }),
        ),
  ];

  let resolved = 0;
  signals.forEach((signal) =>
    Promise.resolve(signal).then(() => {
      resolved += 1;
    }),
  );

  const frame = () => {
    const elapsed = performance.now() - start;
    const real = (resolved / signals.length) * 100;

    const creep = Math.min(95, (elapsed / MAX_MS) * 95);
    const target = Math.max(real, creep);

    progress.value = Math.min(
      100,
      Math.ceil(progress.value + (target - progress.value) * 0.12),
    );

    const done =
      (resolved === signals.length && elapsed >= MIN_MS) || elapsed >= MAX_MS;

    if (done) {
      progress.value = 100;
      setTimeout(() => {
        isLoading.value = false;
      }, 250);
      return;
    }

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

export function useLoader() {
  if (!started && typeof window !== 'undefined') {
    started = true;
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }

  return { progress, isLoading, isGone, markGone };
}
