<template>
  <Transition name="loader-fade" @after-leave="markGone">
    <div v-if="isLoading" class="loader" aria-hidden="true">
      <div class="loader__progress">{{ progress }}%</div>

      <div class="loader__border" :style="{ height: `${progress}%` }"></div>
    </div>
  </Transition>
</template>

<script setup>
import { useLoader } from '@/composables/useLoader';

const { progress, isLoading, markGone } = useLoader();
</script>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 40px 64px;
  background: var(--white);
}

.loader__progress {
  color: var(--blue-100);
  text-align: center;
  font-size: clamp(66px, 10vw, 140px);
  line-height: 1;
}

.loader__border {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 0;
  background: var(--lime-400);
}

.loader-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loader-fade-leave-to {
  opacity: 0;
}

@media (width < 768px) {
  .loader {
    padding: 32px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-fade-leave-active {
    transition: none;
  }
}
</style>
