<template>
  <!-- The live region is always in the DOM, so screen readers announce the
       notice when it appears. -->
  <div class="sent-notice-region" role="status" aria-live="polite">
    <Transition name="sent-notice">
      <AppCard
        v-if="notice"
        :key="notice.at"
        as="aside"
        class="sent-notice"
        plate="var(--lime-400)"
        plate-side="top-left"
        :plate-size="6"
        @mouseenter="hold"
        @mouseleave="release"
        @focusin="hold"
        @focusout="release"
      >
        <span class="sent-notice__glyph" aria-hidden="true">
          <img :src="acceptedGlyph" alt="" />
        </span>

        <div class="sent-notice__body">
          <p class="sent-notice__title">Message sent</p>
          <p class="sent-notice__text">
            Thanks{{ notice.name ? `, ${notice.name}` : '' }}! We’ve received
            your request and will get back to you
            <template v-if="notice.email">
              at <span class="sent-notice__email">{{ notice.email }}</span>
            </template>
            soon.
          </p>
        </div>

        <button
          type="button"
          class="sent-notice__close"
          aria-label="Close the notice"
          @click="dismiss"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </AppCard>
    </Transition>
  </div>
</template>

<script setup>
import acceptedGlyph from '@/assets/icons/form/status-accepted.svg';
import AppCard from '@/components/ui/AppCard.vue';
import { useContactNotice } from '@/composables/useContactNotice';

const { notice, dismiss, hold, release } = useContactNotice();
</script>

<style scoped>
.sent-notice {
  --card-pad: 14px;
  --card-radius: 8px;
  --card-shadow: var(--shadow-card);

  position: fixed;
  right: var(--container-gutter);
  bottom: var(--container-padding);
  z-index: 9001;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: min(400px, calc(100vw - 2 * var(--container-padding-mobile)));
}

.sent-notice__glyph {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: var(--black);
}

.sent-notice__glyph img {
  display: block;
  width: 19px;
  height: auto;
}

.sent-notice__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.sent-notice__title {
  color: var(--navy-100);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.sent-notice__text {
  color: var(--gray-300);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.sent-notice__email {
  color: var(--navy-300);
  overflow-wrap: anywhere;
}

.sent-notice__close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin: -4px -4px 0 0;
  border-radius: 4px;
  color: var(--navy-400);
  transition: color 0.2s ease;
}

.sent-notice__close:hover {
  color: var(--navy-100);
}

.sent-notice__close:focus-visible {
  outline: 2px solid var(--navy-300);
  outline-offset: 1px;
}

.sent-notice__close svg {
  width: 16px;
  height: 16px;
}

.sent-notice-enter-active,
.sent-notice-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.sent-notice-enter-from,
.sent-notice-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Phones: the cookie notice sits at the bottom, so this one goes on top. */
@media (width < 768px) {
  .sent-notice {
    top: var(--container-padding-mobile);
    right: var(--container-padding-mobile);
    bottom: auto;
    left: var(--container-padding-mobile);
    width: auto;
  }

  .sent-notice-enter-from,
  .sent-notice-leave-to {
    transform: translateY(-12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sent-notice-enter-active,
  .sent-notice-leave-active {
    transition: none;
  }
}
</style>
