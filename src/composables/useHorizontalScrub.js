import { gsap } from '@/composables/useGsap';

export function createHorizontalScrub(trigger, track, { distance } = {}) {
  if (!trigger || !track) return null;
  const overflow = () => Math.max(0, distance ? distance() : track.scrollWidth - trigger.clientWidth);
  return gsap.to(track, {
    x: () => -overflow(), ease: 'none',
    scrollTrigger: {
      trigger, start: 'top top',
      end: () => `+=${Math.max(1, overflow()) + window.innerHeight * 0.4}`,
      pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
}
