import { computed, reactive } from 'vue';

const locks = reactive(new Set());
const isHeaderLocked = computed(() => locks.size > 0);

export function useHeaderLock() {
  return {
    isHeaderLocked,
    setHeaderLock: (key, on) => (on ? locks.add(key) : locks.delete(key)),
  };
}
