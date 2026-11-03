<template>
  <component
    :is="as"
    class="card"
    :class="{ 'card--plate': Boolean(plate) }"
    :style="plateStyle"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const SIGNS = {
  'top-left': [-1, -1],
  'top-right': [1, -1],
  'bottom-left': [-1, 1],
  'bottom-right': [1, 1],
};

const props = defineProps({
  as: { type: [String, Object], default: 'div' },
  plate: { type: String, default: '' },
  plateSide: {
    type: String,
    default: 'top-left',
    validator: (value) =>
      ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value),
  },
  plateSize: { type: [Number, String], default: 12 },
});

const plateStyle = computed(() => {
  if (!props.plate) return null;

  const [sx, sy] = SIGNS[props.plateSide] ?? SIGNS['top-left'];
  const size =
    typeof props.plateSize === 'number'
      ? `${props.plateSize}px`
      : props.plateSize;

  return {
    '--card-plate-color': props.plate,
    '--card-plate-x': `calc(${sx} * ${size})`,
    '--card-plate-y': `calc(${sy} * ${size})`,
  };
});
</script>

<style scoped>
.card {
  box-sizing: border-box;
  padding: var(--card-pad, 16px);
  border: var(--card-border-width, 2px) solid
    var(--card-border-color, var(--black));
  border-radius: var(--card-radius, 12px);
  background: var(--card-bg, var(--white));
  box-shadow: var(--card-shadow, none);
}

.card--plate {
  box-shadow:
    var(--card-plate-x) var(--card-plate-y) 0 0 var(--card-plate-color),
    var(--card-plate-x) var(--card-plate-y) 0
      var(--card-plate-outline, var(--card-border-width, 2px))
      var(--card-plate-outline-color, var(--black)),
    var(--card-shadow, 0 0 transparent);
}
</style>
