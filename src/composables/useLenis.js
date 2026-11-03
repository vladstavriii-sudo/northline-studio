import { onMounted, onUnmounted } from 'vue';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/composables/useGsap';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

let lenis = null;

export const getLenis = () => lenis;

export function useLenis() {
  const raf = (time) => lenis?.raf(time * 1000);

  onMounted(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (prefersReducedMotion()) return;

    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  });

  onUnmounted(() => {
    gsap.ticker.remove(raf);

    lenis?.destroy();
    lenis = null;
  });

  return {
    getLenis,
  };
}
