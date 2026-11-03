import { ref } from 'vue';

const query =
  typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)')
    : null;

const reduced = ref(query?.matches === true);

query?.addEventListener('change', (event) => {
  reduced.value = event.matches;
});

export const prefersReducedMotion = () => reduced.value;
