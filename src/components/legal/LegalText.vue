<template>
  <template v-for="(part, i) in parts" :key="i">
    <mark v-if="isPlaceholder(part)" class="legal-t__todo">{{ part }}</mark>
    <template v-else>{{ part }}</template>
  </template>
</template>

<script setup>
import { computed } from 'vue';
import {
  PLACEHOLDER_PATTERN,
  isPlaceholder,
} from '@/content/legal/legal.data.js';

const props = defineProps({
  text: { type: String, required: true },
});

const parts = computed(() =>
  props.text.split(PLACEHOLDER_PATTERN).filter(Boolean),
);
</script>

<style scoped>
.legal-t__todo {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--lime-400);
  color: var(--black);
  font-weight: 600;
}
</style>
