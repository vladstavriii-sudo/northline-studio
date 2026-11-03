import { onMounted, onBeforeUnmount } from 'vue';
import { gsap } from '@/composables/useGsap';

export function useMagneticEffect(
  getEls,
  { strength = 12, duration = 0.4, ease = 'power3.out' } = {},
) {
  const cleanups = [];

  const bind = (el) => {
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration, ease });
    const yTo = gsap.quickTo(el, 'y', { duration, ease });

    const onMove = ({ clientX, clientY }) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      xTo(((clientX - (left + width / 2)) / (width / 2)) * strength);
      yTo(((clientY - (top + height / 2)) / (height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    });
  };

  onMounted(() => Array.from(getEls() || []).forEach(bind));
  onBeforeUnmount(() => cleanups.forEach((fn) => fn()));
}
