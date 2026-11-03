<template>
  <div class="options__grid">
    <AppTag
      v-for="tag in tags"
      :key="tag.text"
      :variant="tag.class"
      :icon="tag.icon"
      :label="tag.text"
      :style="{ '--mobile-order': tag.mobileOrder }"
    />
    <span
      v-for="row in rows - 1"
      :key="`break-${row}`"
      class="options__break"
      :style="{ '--mobile-order': row * 10 + 9 }"
      aria-hidden="true"
    ></span>
  </div>
</template>

<script setup>
import AppTag from '@/components/ui/AppTag.vue';

defineProps({
  tags: { type: Array, default: () => [] },
  rows: { type: Number, default: 1 },
});
</script>

<style scoped>
.options__grid {
  --tag-height: 53px;
  --tag-pad: 12px 16px;
  --tag-pad-icon: 4px 16px 4px 4px;
  --tag-font: 19px;
  --tag-gap: 10px;
  --tag-icon-w: 74px;
  --tag-icon-h: 45px;
  --tag-icon-radius: 5px;

  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 900px;
  align-items: center;
}

@media (width < 1440px) {
  .options__grid {
    justify-content: center;
  }
}

@media (width < 768px) {
  .options__grid {
    --k: min(1px, 100cqw / 375);
    --tag-height: calc(28 * var(--k));
    --tag-pad: calc(6 * var(--k)) calc(8 * var(--k));
    --tag-pad-icon: calc(5 * var(--k)) calc(8 * var(--k));
    --tag-font: calc(12 * var(--k));
    --tag-gap: calc(10 * var(--k));
    --tag-icon-w: calc(28 * var(--k));
    --tag-icon-h: calc(18 * var(--k));
    --tag-icon-radius: calc(2 * var(--k));

    max-width: 433px;
    gap: 0 calc(8 * var(--k));
    margin-block: -4px;
  }

  .options__grid > * {
    order: var(--mobile-order);
    margin-block: 4px;
    white-space: nowrap;
  }
}

.options__break {
  display: none;
}

@media (width < 768px) {
  .options__break {
    display: block;
    flex-basis: 100%;
    height: 0;
    margin: 0;
  }
}
</style>
