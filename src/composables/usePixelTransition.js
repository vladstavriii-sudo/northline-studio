import { ref } from 'vue';
import { gsap } from '@/composables/useGsap';
import { prefersReducedMotion } from '@/composables/useReducedMotion';

const COLUMNS = 28;
const MIN_BLOCK = 40;
const COVER_S = 0.6;
const REVEAL_S = 0.6;
const STEPS = 18;

const isCovered = ref(false);

let canvas = null;
let grid = null;
let tween = null;
let covering = null;

function measure() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const block = Math.max(MIN_BLOCK, Math.ceil(width / COLUMNS));
  const cols = Math.ceil(width / block);
  const rows = Math.ceil(height / block);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = getComputedStyle(canvas).color;

  grid = { ctx, block, cols, total: cols * rows };
}

function shuffled(total) {
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function cell(index, paint) {
  const { ctx, block, cols } = grid;
  const x = (index % cols) * block;
  const y = Math.floor(index / cols) * block;
  if (paint) ctx.fillRect(x, y, block, block);
  else ctx.clearRect(x, y, block, block);
}

function run(paint, duration) {
  const order = shuffled(grid.total);
  const state = { progress: 0 };
  let done = 0;

  tween?.kill();
  return new Promise((resolve) => {
    tween = gsap.to(state, {
      progress: 1,
      duration,
      ease: `steps(${STEPS})`,
      onUpdate: () => {
        const target = Math.round(state.progress * grid.total);
        for (; done < target; done += 1) cell(order[done], paint);
      },
      onComplete: resolve,
      onInterrupt: resolve,
    });
  });
}

export function registerPixelCanvas(el) {
  canvas = el;
}

export function coverPage() {
  if (!canvas || prefersReducedMotion()) return Promise.resolve();
  if (covering) return covering;

  measure();
  grid.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  isCovered.value = true;
  covering = run(true, COVER_S);
  return covering;
}

export async function revealPage() {
  if (!covering) return;
  await covering;
  covering = null;
  await run(false, REVEAL_S);
  if (!covering) isCovered.value = false;
}

export function usePixelTransition() {
  return { isCovered };
}
