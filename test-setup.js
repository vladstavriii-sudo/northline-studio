import { vi } from 'vitest';
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn((query) => ({ matches: false, media: query,
    onchange: null, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } }));
}
