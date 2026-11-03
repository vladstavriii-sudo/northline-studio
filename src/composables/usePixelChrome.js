import { ref } from 'vue';

const isPixelChrome = ref(false);

export function usePixelChrome() {
  return { isPixelChrome, setPixelChrome: (on) => (isPixelChrome.value = on) };
}
