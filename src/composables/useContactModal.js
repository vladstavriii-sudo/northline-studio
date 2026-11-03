import { ref } from 'vue';
import { getLenis } from './useLenis';

const isOpen = ref(false);

let opener = null;

function open() {
  if (isOpen.value) return;
  opener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  isOpen.value = true;
  getLenis()?.stop();
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  getLenis()?.start();
  opener?.focus?.({ preventScroll: true });
  opener = null;
}

export function useContactModal() {
  return { isOpen, open, close };
}
