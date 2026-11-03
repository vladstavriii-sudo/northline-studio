<template>
  <component :is="as">
    <span class="wu-text__accessible">{{ text }}</span>
    <span aria-hidden="true"><template v-for="(word, index) in words" :key="index"><span class="wu-text__word"><span v-for="(letter, i) in Array.from(word)" :key="i" class="wu-text__char">{{ letter }}</span></span>{{ index < words.length - 1 ? ' ' : '' }}</template></span>
  </component>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ as: { type: String, default: 'span' }, text: { type: String, required: true } });
const words = computed(() => props.text.split(' '));
</script>

<style scoped>
.wu-text__word { display: inline-block; white-space: nowrap; }
.wu-text__char { display: inline-block; }
.wu-text__accessible {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
</style>
