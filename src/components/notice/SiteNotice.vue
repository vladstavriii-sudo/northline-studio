<template>
  <Transition name="notice-fade">
    <AppCard
      v-if="visible"
      as="aside"
      class="site-notice"
      role="region"
      aria-label="Site notice"
      plate="var(--lime-400)"
      plate-side="top-left"
      :plate-size="6"
    >
      <p class="site-notice__text">
        This website uses cookies.
        <RouterLink class="site-notice__link" :to="{ name: 'privacy' }"
          >Learn more</RouterLink
        >.
      </p>

      <div class="site-notice__actions">
        <button
          type="button"
          class="site-notice__btn site-notice__btn--accept"
          @click="decide('accepted')"
        >
          <span class="site-notice__btn-icon">
            <img :src="checkIcon" alt="" />
          </span>
          Accept all
        </button>

        <button
          type="button"
          class="site-notice__btn site-notice__btn--reject"
          @click="decide('rejected')"
        >
          <span class="site-notice__btn-icon">
            <img :src="rejectIcon" alt="" />
          </span>
          Reject all
        </button>
      </div>
    </AppCard>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import checkIcon from '@/assets/icons/check-dotted.svg';
import rejectIcon from '@/assets/icons/form/status-failed.svg';
import AppCard from '@/components/ui/AppCard.vue';
import { RouterLink } from 'vue-router';

const STORAGE_KEY = 'nrthline:cookie-consent';
const visible = ref(false);

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

onMounted(() => {
  const stored = read();
  visible.value = stored !== 'accepted' && stored !== 'rejected';
});

function decide(choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    console.warn(
      'SiteNotice: localStorage blocked, dismissing for this session',
    );
    return;
  }
  visible.value = false;
}
</script>

<style scoped>
.site-notice {
  --card-pad: 12px;
  --card-radius: 8px;
  --card-shadow: var(--shadow-card);

  position: fixed;
  left: var(--viewport-edge);
  bottom: var(--viewport-edge);
  z-index: 9000;
  width: min(360px, calc(100vw - 2 * var(--container-padding-mobile)));
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.site-notice__text {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-300);
}

.site-notice__link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.site-notice__actions {
  display: flex;
  gap: 12px;
}

.site-notice__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 8px 18px 8px 8px;
  border: 1px solid var(--black);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 14px;
  line-height: normal;
  cursor: var(--cursor-pointer);
  transition: filter 0.2s ease;
}

.site-notice__btn:hover {
  filter: brightness(1.05);
}

.site-notice__btn--accept {
  color: var(--black);
  background: linear-gradient(to bottom, #d3ff48, #d5f66e);
  box-shadow: var(--shadow-green);
}

.site-notice__btn--reject {
  color: var(--white);
  background: var(--red-100);
  box-shadow: var(--shadow-red);
}

.site-notice__btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: var(--black);
}

.site-notice__btn-icon img {
  width: 20px;
  height: 16px;
  object-fit: contain;
}

.site-notice__btn--reject .site-notice__btn-icon img {
  width: 16px;
}

.notice-fade-enter-active,
.notice-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (width < 768px) {
  .site-notice {
    left: var(--container-padding-mobile);
    right: var(--container-padding-mobile);
    bottom: var(--container-padding-mobile);
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notice-fade-enter-active,
  .notice-fade-leave-active {
    transition: none;
  }
}
</style>
