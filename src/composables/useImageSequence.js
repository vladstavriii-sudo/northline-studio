import { ref, shallowRef } from 'vue';

const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;
const MAX_DPR = 2;

export function useImageSequence(urls) {
  const images = shallowRef([]);
  const firstFrameReady = ref(false);

  const total = urls.length;

  let started = false;

  function load() {
    if (started) return Promise.resolve();
    started = true;

    images.value = urls.map(() => null);

    return Promise.all(
      urls.map(
        (url, i) =>
          new Promise((resolve) => {
            const img = new Image();

            const done = () => {
              images.value[i] = img.naturalWidth ? img : null;
              if (i === 0) firstFrameReady.value = true;
              resolve();
            };
            img.onload = done;
            img.onerror = done;
            img.decoding = 'async';
            img.src = url;
          }),
      ),
    );
  }

  function geometry(canvas) {
    const boxW = canvas.clientWidth;
    const boxH = canvas.clientHeight;
    const scale = Math.max(boxW / FRAME_WIDTH, boxH / FRAME_HEIGHT);
    const drawW = FRAME_WIDTH * scale;
    const drawH = FRAME_HEIGHT * scale;

    return {
      boxW,
      boxH,
      scale,
      drawW,
      drawH,
      offsetX: (boxW - drawW) / 2,
      offsetY: (boxH - drawH) / 2,
    };
  }

  function resize(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    return dpr;
  }

  function draw(canvas, index, box) {
    if (!canvas) return;

    const img =
      images.value[Math.max(0, Math.min(total - 1, Math.round(index)))];
    if (!img) return;

    const dpr = resize(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY, drawW, drawH } = box ?? geometry(canvas);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function mapRect(canvas, rect, box) {
    if (!canvas) return null;

    const geo = box ?? geometry(canvas);
    const { offsetX, offsetY } = geo;
    const scale = geo.drawW / FRAME_WIDTH;

    return {
      left: offsetX + rect.x * scale,
      top: offsetY + rect.y * scale,
      width: rect.w * scale,
      height: rect.h * scale,
    };
  }

  return {
    load,
    draw,
    mapRect,
    geometry,
    firstFrameReady,
  };
}

export function framesFromGlob(globResult) {
  return Object.entries(globResult)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);
}
