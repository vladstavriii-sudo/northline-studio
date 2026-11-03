<template>
  <component
    :is="rootTag"
    v-bind="rootAttrs"
    class="case-card"
    :class="{ 'case-card--link': isLink }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="hovered = true"
    @focusout="hovered = false"
  >
    <ProjectThumb
      class="case-card__thumb"
      :still="thumb"
      :video="thumbVideo"
      :active="hovered"
    />

    <div class="case-card__body">
      <span class="case-card__label">NEW CASE</span>
      <div class="case-card__meta-group">
        <p class="case-card__title">{{ title }}</p>
        <p v-if="meta" class="case-card__meta">{{ meta }}</p>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProjectThumb from '@/components/projects/ProjectThumb.vue';

const props = defineProps({
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  thumb: { type: String, default: '' },
  thumbVideo: { type: String, default: '' },
  slug: { type: String, default: '' },
});

const hovered = ref(false);
const isLink = computed(() => Boolean(props.slug));
const rootTag = computed(() => (isLink.value ? RouterLink : 'article'));
const rootAttrs = computed(() =>
  isLink.value ? { to: { name: 'project', params: { slug: props.slug } } } : {},
);
</script>

<style scoped>
.case-card {
  display: inline-grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 14px;
  box-sizing: border-box;
  width: 348px;
  min-height: 118px;
  max-width: 100%;
  padding: 6px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: var(--white);
  box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
  color: inherit;
  text-decoration: none;
}

.case-card__thumb {
  flex-shrink: 0;
  width: 104px;
  height: 104px;
  border-radius: 8px;
}

.case-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 2px 6px 6px 0;
  color: var(--black);
}

.case-card__label {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.case-card__title {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--black);
}

.case-card__meta {
  margin-top: 2px;
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--black);
}

.case-card--link {
  border-radius: 8px;
  transition: transform 0.3s var(--transition-timing);
}

.case-card--link:hover,
.case-card--link:focus-visible {
  transform: translateY(-2px);
}

.case-card--link:hover,
.case-card--link:focus-visible {
  border-color: var(--black);
}

.case-card--link:focus-visible {
  outline: 2px solid var(--lime-400);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .case-card--link,
  .case-card__body {
    transition: none;
  }
}
</style>
