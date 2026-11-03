import { onMounted, onUnmounted, nextTick, ref } from 'vue';
import { gsap } from '@/composables/useGsap';

export function useScrollScene(setup, { root = ref(null) } = {}) {
  let ctx;
  let cleanup;

  onMounted(async () => {
    await nextTick();
    if (!root.value) return;

    ctx = gsap.context((self) => {
      cleanup = setup(root.value, self) || undefined;
    }, root.value);
  });

  onUnmounted(() => {
    cleanup?.();
    ctx?.revert();
  });

  return root;
}
