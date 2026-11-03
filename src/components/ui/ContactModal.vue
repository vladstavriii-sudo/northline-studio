<template>
  <Teleport to="body">
    <Transition name="cmodal">
      <div
        v-if="isOpen"
        ref="overlayRef"
        class="cmodal"
        role="dialog"
        aria-modal="true"
        aria-label="Drop us a message"
        @click.self="close"
      >
        <div class="cmodal__host">
          <ContactForm @close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import ContactForm from './ContactForm.vue';
import { useContactModal } from '@/composables/useContactModal';

const { isOpen, close } = useContactModal();

const overlayRef = ref(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusable = () =>
  overlayRef.value
    ? [...overlayRef.value.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      )
    : [];

function onKeydown(event) {
  if (event.key === 'Escape') {
    close();
    return;
  }

  if (event.key !== 'Tab') return;

  const items = focusable();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (
    event.shiftKey &&
    (active === first || !overlayRef.value.contains(active))
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(isOpen, (open) => {
  if (open) document.addEventListener('keydown', onKeydown);
  else document.removeEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.cmodal {
  --u-form: min(1px, calc((100dvh - 68px) / 798), calc((100vw - 68px) / 559));
  position: fixed;
  inset: 0;
  z-index: 101;
  display: flex;
  overflow-y: auto;
  padding: 20px;
  background: rgba(4, 20, 45, 0.45);
}

.cmodal__host {
  box-sizing: content-box;
  width: calc(559 * var(--u-form));
  margin: auto;
  padding: 14px;
}

.cmodal-enter-active,
.cmodal-leave-active {
  transition: opacity 0.25s ease;
}

.cmodal-enter-from,
.cmodal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cmodal-enter-active,
  .cmodal-leave-active {
    transition: none;
  }
}
</style>
