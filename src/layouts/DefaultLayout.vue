<template>
  <div class="layout">
    <Header />

    <main class="layout__main">
      <slot />
    </main>

    <Footer :bar-only="barOnlyFooter" />
  </div>
</template>

<script setup>
import Header from '@/components/header/Header.vue';
import Footer from '@/components/footer/Footer.vue';

defineProps({
  barOnlyFooter: { type: Boolean, default: false },
});
</script>
