<template>
  <component
    :is="as"
    class="tag"
    :class="[`tag--${variant}`, { 'tag--outlined': outlined }]"
  >
    <img v-if="icon" class="tag__icon" :src="icon" alt="" />
    <span class="tag__label"
      ><slot>{{ label }}</slot></span
    >
  </component>
</template>

<script setup>
defineProps({
  as: { type: [String, Object], default: 'div' },
  variant: { type: String, required: true },
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  outlined: { type: Boolean, default: false },
});
</script>

<style scoped>
.tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tag-gap, 6px);
  height: var(--tag-height, auto);
  padding: var(--tag-pad, 12px 16px);
  border-radius: var(--tag-radius, 8px);
  font-family: var(--font-mono);
  font-size: var(--tag-font, 19px);
  font-weight: 500;
  line-height: var(--tag-line, normal);
  text-align: center;
  user-select: none;
}

.tag:has(.tag__icon) {
  padding: var(--tag-pad-icon, 4px 16px 4px 4px);
}

.tag__icon {
  display: block;
  flex-shrink: 0;
  width: var(--tag-icon-w, 74px);
  height: var(--tag-icon-h, 45px);
  border-radius: var(--tag-icon-radius, 5px);
  object-fit: cover;
}
</style>
