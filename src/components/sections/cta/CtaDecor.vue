<template>
  <span
    v-for="mark in DECOR"
    :key="mark.id"
    class="decor"
    :class="[`decor--${mark.type}`, { 'is-open': open }]"
    :style="style(mark)"
    aria-hidden="true"
  ></span>
</template>

<script setup>
import { DECOR } from './cta.data.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  narrow: { type: Boolean, default: false },
});

function style(mark) {
  if (props.narrow) {
    if (mark.mx === undefined) return { display: 'none' };
    return {
      '--decor-x': mark.mx,
      '--decor-y': mark.my,
      '--decor-form-x': mark.mx,
      '--decor-form-y': mark.my,
      '--decor-size': 13,
    };
  }

  const out = {
    '--decor-x': mark.x,
    '--decor-y': mark.y,
    '--decor-form-x': mark.fx ?? mark.x,
    '--decor-form-y': mark.fy ?? mark.y,
  };
  if (mark.formOnly) out['--decor-idle-opacity'] = 0;
  if (mark.pinLeft) out['--decor-pin'] = 1;
  return out;
}
</script>

<style scoped>
.decor {
  position: absolute;
  top: 0;
  left: 0;
  translate: calc(var(--decor-x) * var(--u))
    calc(var(--decor-y) * var(--cta-ky, 1) * var(--u));
  opacity: var(--decor-idle-opacity, 1);
  background-repeat: no-repeat;
  pointer-events: none;
  transition:
    translate var(--cta-duration) var(--cta-ease),
    opacity 0.35s ease;
}

.decor.is-open {
  translate: calc(
      var(--decor-form-x) * var(--u) - var(--decor-pin, 0) *
        var(--cta-gutter, 0px)
    )
    calc(var(--decor-form-y) * var(--cta-ky, 1) * var(--u));
  opacity: 1;
}

.decor--plus {
  --decor-color: var(--pink-400);
  --u-decor: calc(var(--decor-size, 28) * var(--u) / 28);

  width: calc(28 * var(--u-decor));
  height: calc(28 * var(--u-decor));
  background-image:
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0);
  background-size:
    calc(8 * var(--u-decor)) calc(9 * var(--u-decor)),
    calc(8 * var(--u-decor)) calc(9 * var(--u-decor)),
    calc(9 * var(--u-decor)) calc(8 * var(--u-decor)),
    calc(9 * var(--u-decor)) calc(8 * var(--u-decor));
  background-position:
    calc(10 * var(--u-decor)) 0,
    calc(10 * var(--u-decor)) calc(19 * var(--u-decor)),
    calc(19 * var(--u-decor)) calc(10 * var(--u-decor)),
    0 calc(10 * var(--u-decor));
}

.decor--cross {
  --decor-color: var(--lime-200);
  --u-decor: calc(var(--decor-size, 17) * var(--u) / 17);

  width: calc(17 * var(--u-decor));
  height: calc(17 * var(--u-decor));
  background-image:
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0);
  background-size:
    calc(5 * var(--u-decor)) calc(17 * var(--u-decor)),
    calc(17 * var(--u-decor)) calc(5 * var(--u-decor));
  background-position:
    calc(6 * var(--u-decor)) 0,
    0 calc(6 * var(--u-decor));
}

.decor--frame {
  --decor-color: var(--lime-200);
  --u-decor: calc(var(--decor-size, 25) * var(--u) / 25);

  width: calc(25 * var(--u-decor));
  height: calc(25 * var(--u-decor));
  background-image:
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0),
    linear-gradient(var(--decor-color) 0 0);
  background-size:
    calc(6 * var(--u-decor)) calc(10 * var(--u-decor)),
    calc(10 * var(--u-decor)) calc(5 * var(--u-decor)),
    calc(10 * var(--u-decor)) calc(6 * var(--u-decor)),
    calc(5 * var(--u-decor)) calc(10 * var(--u-decor)),
    calc(6 * var(--u-decor)) calc(10 * var(--u-decor)),
    calc(10 * var(--u-decor)) calc(5 * var(--u-decor)),
    calc(10 * var(--u-decor)) calc(6 * var(--u-decor)),
    calc(5 * var(--u-decor)) calc(10 * var(--u-decor));
  background-position:
    0 0,
    0 0,
    calc(15 * var(--u-decor)) 0,
    calc(20 * var(--u-decor)) 0,
    calc(19 * var(--u-decor)) calc(15 * var(--u-decor)),
    calc(15 * var(--u-decor)) calc(20 * var(--u-decor)),
    0 calc(19 * var(--u-decor)),
    0 calc(15 * var(--u-decor));
}

@media (prefers-reduced-motion: reduce) {
  .decor {
    transition-duration: 0.01ms;
  }
}
</style>
