import { computed, onBeforeUnmount, ref } from 'vue';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  frame: 1440,
};

export const below = (name) => `(width < ${BREAKPOINTS[name]}px)`;

export const atLeast = (name) => `(width >= ${BREAKPOINTS[name]}px)`;

export function useMediaQuery(query) {
  const media = window.matchMedia(query);
  const matches = ref(media.matches);
  const sync = (event) => {
    matches.value = event.matches;
  };

  media.addEventListener('change', sync);
  onBeforeUnmount(() => media.removeEventListener('change', sync));

  return matches;
}

const width = ref(0);

let listening = false;
let raf = 0;

function measure() {
  raf = 0;
  width.value = window.innerWidth;
}

function onResize() {
  if (!raf) raf = requestAnimationFrame(measure);
}

function listen() {
  if (listening || typeof window === 'undefined') return;

  listening = true;
  measure();
  window.addEventListener('resize', onResize, { passive: true });
}

const isDesktop = computed(() => width.value >= BREAKPOINTS.desktop);

const isBelow = (name) =>
  computed(() => width.value > 0 && width.value < BREAKPOINTS[name]);

export function useBreakpoints() {
  listen();

  return { isDesktop, isBelow };
}
