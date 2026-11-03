<template>
  <component :is="as">
    <span class="archive-copy__accessible">{{ text }}</span>
    <span aria-hidden="true">
      <span v-for="(line, i) in lines" :key="i" class="archive-copy__line"><template v-for="(word, j) in line" :key="j"><span class="archive-copy__word"><span v-for="(char, k) in Array.from(word)" :key="k" class="archive-copy__char">{{ char }}</span></span>{{ j < line.length - 1 ? ' ' : '' }}</template></span>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ as: { type: String, default: 'span' }, text: { type: String, required: true } });
const lines = computed(() => props.text.split('\n').map((line) => line.split(' ')));
</script>

<style scoped>
.archive-copy__line { display: block; }
.archive-copy__word { display: inline-block; white-space: nowrap; }
.archive-copy__char { display: inline-block; }
.archive-copy__accessible {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
</style>
