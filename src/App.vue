<script setup>
import { watch } from 'vue';
import { useLenis, getLenis } from '@/composables/useLenis';
import { useLoader } from '@/composables/useLoader';
import { ScrollTrigger } from '@/composables/useGsap';
import { useDocumentHead } from '@/composables/useSeo';
import AppLoader from '@/components/loader/AppLoader.vue';
import ContactSentNotice from '@/components/notice/ContactSentNotice.vue';
import SiteNotice from '@/components/notice/SiteNotice.vue';
import ContactModal from '@/components/ui/ContactModal.vue';
import PixelTransition from '@/components/transition/PixelTransition.vue';

useLenis();
useDocumentHead();
const { isLoading } = useLoader();

watch(
  isLoading,
  (loading) => {
    const lenis = getLenis();
    if (loading) {
      lenis?.stop();
      document.documentElement.classList.add('is-loading');
    } else {
      document.documentElement.classList.remove('is-loading');
      lenis?.start();
      ScrollTrigger.refresh();
    }
  },
  { immediate: true },
);
</script>

<template>
  <AppLoader />

  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </RouterView>

  <SiteNotice />

  <ContactSentNotice />

  <ContactModal />

  <PixelTransition />
</template>
