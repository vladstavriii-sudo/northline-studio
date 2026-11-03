import { onBeforeUnmount, onMounted } from 'vue';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

export function createVideoGate({ threshold = 0.25 } = {}) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) video.play?.().catch(() => {});
        else video.pause?.();
      }
    },
    { threshold },
  );

  return {
    observe(target) {
      if (!target) return;
      const list = target instanceof Element ? [target] : Array.from(target);
      list.forEach((video) => observer.observe(video));
    },
    disconnect: () => observer.disconnect(),
  };
}

export function useVideoAutoplay(getTargets, { threshold = 0.25 } = {}) {
  let gate = null;

  onMounted(() => {
    if (prefersReducedMotion()) return;

    gate = createVideoGate({ threshold });
    gate.observe(getTargets());
  });

  onBeforeUnmount(() => gate?.disconnect());
}
