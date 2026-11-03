<template>
  <template v-for="(block, i) in blocks" :key="i">
    <h3 v-if="block.h3" class="legal-b__sub">{{ block.h3 }}</h3>

    <ul v-else-if="block.ul" class="legal-b__list">
      <li v-for="item in block.ul" :key="item">{{ item }}</li>
    </ul>

    <p v-else-if="block.lines" class="legal-b__lines">
      <template v-for="(line, n) in block.lines" :key="line">
        <br v-if="n" />
        <LegalText :text="line" />
      </template>
    </p>

    <p v-else-if="block.link" class="legal-b__p">
      <RouterLink class="legal-b__link" :to="block.link.to">
        {{ block.link.text }}
      </RouterLink>
    </p>

    <p v-else-if="block.todo" class="legal-b__todo">
      <strong>Copy still to be drafted.</strong> {{ block.todo }}
    </p>

    <p v-else class="legal-b__p"><LegalText :text="block.p" /></p>
  </template>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import LegalText from './LegalText.vue';

defineProps({
  blocks: { type: Array, required: true },
});
</script>

<style scoped>
.legal-b__p,
.legal-b__lines {
  margin: 0 0 12px;
}

.legal-b__sub {
  margin: 20px 0 8px;
  font-family: var(--font-mono);
  font-size: 1em;
  font-weight: 600;
}

.legal-b__list {
  margin: 0 0 12px;
  padding-left: 27px;
  list-style: disc;
}

.legal-b__link {
  color: var(--blue-100);
  text-underline-offset: 3px;
}

.legal-b__todo {
  margin: 0 0 12px;
  padding: 12px 16px;
  border: 1px dashed var(--red-200);
  border-radius: 8px;
  color: var(--red-200);
  background: var(--white);
}
</style>
