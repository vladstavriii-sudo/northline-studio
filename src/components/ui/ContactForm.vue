<template>
  <div class="cform" role="group" :aria-labelledby="`${uid}-title`">
    <div class="cform__plate" aria-hidden="true"></div>

    <form
      :id="formId || `${uid}-form`"
      ref="formRef"
      class="cform__card"
      novalidate
      :inert="open ? undefined : true"
      @submit.prevent="handleSubmit"
      @keydown.esc="emit('close')"
    >
      <button
        type="button"
        class="cform__close"
        aria-label="Close the contact form"
        @click="emit('close')"
      >
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="1"
            y="1"
            width="30"
            height="30"
            rx="4"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M9 9L23 23M23 9L9 23"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <header class="cform__head">
        <img class="cform__mark" :src="mailMark" alt="" />
        <p :id="`${uid}-title`" class="cform__title">Drop us a message</p>
        <p class="cform__lead">
          We’d love to hear from you. Send us your thoughts, questions, or
          feedback.
        </p>
      </header>

      <div class="cform__fields">
        <div
          v-for="field in FORM_FIELDS"
          :key="field.name"
          class="cform__field"
          :class="[
            `is-${states[field.name]}`,
            { 'cform__field--grow': field.type === 'textarea' },
          ]"
        >
          <div class="cform__label-row">
            <label class="cform__label" :for="`${uid}-${field.name}`">
              {{ field.label }}
            </label>
            <p
              v-if="messages[field.name]"
              :id="`${uid}-${field.name}-note`"
              class="cform__note"
              :role="states[field.name] === 'error' ? 'alert' : undefined"
            >
              {{ messages[field.name] }}
            </p>
          </div>

          <div class="cform__control">
            <textarea
              v-if="field.type === 'textarea'"
              :id="`${uid}-${field.name}`"
              v-model.trim="values[field.name]"
              class="cform__input cform__input--area"
              :name="field.name"
              :maxlength="MAX_LENGTH[field.name]"
              aria-required="true"
              :placeholder="field.placeholder"
              :disabled="isLocked"
              :aria-invalid="states[field.name] === 'error'"
              :aria-describedby="describedBy(field.name)"
              @input="onInput(field.name)"
              @blur="open && touch(field.name)"
            ></textarea>

            <select
              v-else-if="field.type === 'select'"
              :id="`${uid}-${field.name}`"
              v-model="values[field.name]"
              aria-required="true"
              class="cform__input cform__input--select"
              :class="{ 'is-placeholder': !values[field.name] }"
              :name="field.name"
              :disabled="isLocked"
              :aria-invalid="states[field.name] === 'error'"
              :aria-describedby="describedBy(field.name)"
              @change="onInput(field.name, true)"
              @blur="open && touch(field.name)"
            >
              <option value="" disabled>{{ field.placeholder }}</option>
              <option v-for="type in PROJECT_TYPES" :key="type" :value="type">
                {{ type }}
              </option>
            </select>

            <input
              v-else
              :id="`${uid}-${field.name}`"
              v-model.trim="values[field.name]"
              class="cform__input"
              :type="field.type"
              :name="field.name"
              :maxlength="MAX_LENGTH[field.name]"
              aria-required="true"
              :spellcheck="field.type === 'email' ? 'false' : undefined"
              :autocapitalize="field.type === 'email' ? 'off' : undefined"
              :autocomplete="field.autocomplete"
              :placeholder="field.placeholder"
              :disabled="isLocked"
              :aria-invalid="states[field.name] === 'error'"
              :aria-describedby="describedBy(field.name)"
              @input="onInput(field.name)"
              @blur="open && touch(field.name)"
            />

            <span
              v-if="states[field.name] !== 'idle'"
              class="cform__mark-state"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" />
                <path
                  v-if="states[field.name] === 'error'"
                  d="M10 5.5V11M10 14v.01"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  v-else
                  d="M6 10.2l2.8 2.8L14.2 7.6"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>

            <span
              v-if="field.type === 'textarea'"
              class="cform__grip"
              aria-hidden="true"
            >
              <svg viewBox="0 0 14 14" fill="none">
                <path
                  d="M0.5 12.5L12.5 0.5M5.5 13.5L13.5 5.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Honeypot: off-screen and out of the tab order. People never fill
           it; bots that fill every field give themselves away. -->
      <div class="cform__trap" aria-hidden="true">
        <label :for="`${uid}-website`">Leave this field empty</label>
        <input
          :id="`${uid}-website`"
          v-model="trap"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <div class="cform__consent" :class="`is-${states.consent}`">
        <input
          :id="`${uid}-consent`"
          v-model="values.consent"
          class="cform__checkbox"
          type="checkbox"
          name="consent"
          aria-required="true"
          :disabled="isLocked"
          :aria-invalid="states.consent === 'error'"
          :aria-describedby="
            states.consent === 'error' ? `${uid}-consent-note` : undefined
          "
          @change="onInput('consent', true)"
        />
        <label class="cform__consent-text" :for="`${uid}-consent`">
          I agree to the processing of my personal data in accordance with the
          <RouterLink
            class="cform__link"
            :to="{ name: 'privacy' }"
            target="_blank"
            rel="noopener"
            >Privacy Policy</RouterLink
          >.
          <span
            v-if="states.consent === 'error'"
            :id="`${uid}-consent-note`"
            class="cform__note"
            role="alert"
          >
            {{ messages.consent }}
          </span>
        </label>
      </div>

      <div class="cform__submit-block">
        <button
          type="submit"
          class="cform__submit"
          :class="`is-${status}`"
          :disabled="status !== 'idle'"
        >
          <span class="cform__submit-fill" aria-hidden="true"></span>

          <Transition name="cform-button" mode="out-in">
          <span :key="status" class="cform__submit-content">
          <template v-if="status === 'idle'">
            <span class="cform__submit-label">Start a Project</span>
          </template>

          <template v-else-if="status === 'submitting'">
            <svg class="cform__spinner" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 3.667v4.666M16 28.333v-4.66M24.72 24.721l-3.299-3.3M7.279 7.279l3.3 3.3M7.28 24.721l3.3-3.3M24.72 7.279l-3.3 3.3M28.333 16h-4.666M3.667 16h4.666"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span class="cform__sr">Sending…</span>
          </template>

          <template v-else>
            <span class="cform__submit-glyph">
              <img
                :src="status === 'success' ? acceptedGlyph : failedGlyph"
                :class="{ 'cform__accepted-mark': status === 'success' }"
                alt=""
              />
            </span>
            <span class="cform__submit-result">
              {{ status === 'success' ? 'Accepted' : 'Failed' }}
            </span>
          </template>
          </span>
          </Transition>
        </button>

        <p v-if="formError" class="cform__error" role="alert">
          {{ formError }}
        </p>

        <p class="cform__fineprint">
          By submitting this form, you agree to our<br />
          <RouterLink
            class="cform__link"
            :to="{ name: 'privacy' }"
            target="_blank"
            rel="noopener"
            >Privacy Policy</RouterLink
          >
          and
          <RouterLink
            class="cform__link"
            :to="{ name: 'terms' }"
            target="_blank"
            rel="noopener"
            >Terms of Use</RouterLink
          >.
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { nextTick, ref, useId, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import mailMark from '@/assets/images/form-mail-mark.webp';
import acceptedGlyph from '@/assets/icons/form/status-accepted.svg';
import failedGlyph from '@/assets/icons/form/status-failed.svg';
import { useContactForm } from '@/composables/useContactForm';
import { FORM_FIELDS, PROJECT_TYPES } from './contact-form.data.js';
import { LIMITS } from './contact-form.rules.js';

// The browser stops typing at the server's limits.
const MAX_LENGTH = {
  name: LIMITS.name,
  email: LIMITS.email,
  details: LIMITS.details,
};

const props = defineProps({
  formId: { type: String, default: '' },
  open: { type: Boolean, default: true },
});

const emit = defineEmits(['close']);

const uid = useId();
const route = useRoute();
const formRef = ref(null);

const {
  values,
  status,
  isLocked,
  states,
  messages,
  formError,
  trap,
  prepare,
  touch,
  onInput,
  submit,
} = useContactForm();

function describedBy(name) {
  return messages.value[name] ? `${uid}-${name}-note` : undefined;
}

async function handleSubmit() {
  const outcome = await submit({ page: route.fullPath });
  if (outcome !== 'invalid') return;

  await nextTick();
  formRef.value
    ?.querySelector('[aria-invalid="true"]')
    ?.focus({ preventScroll: true });
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    prepare();
    await nextTick();
    formRef.value
      ?.querySelector('input, select, textarea')
      ?.focus({ preventScroll: true });
  },
  { immediate: true },
);
</script>

<style scoped>
@property --cform-wipe {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}

.cform {
  --u: var(--u-form, 1px);
  --cform-border: var(--navy-200);
  --cform-state: var(--navy-200);

  position: relative;
  display: flex;
  width: calc(559 * var(--u));
  height: calc(798 * var(--u));
}

.cform__plate {
  position: absolute;
  top: calc(-13 * var(--u));
  left: calc(-13 * var(--u));
  right: calc(15 * var(--u));
  bottom: calc(15 * var(--u));
  border: calc(3 * var(--u)) solid var(--black);
  border-radius: calc(24 * var(--u));
  background: var(--lime-400);
}

.cform__card {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: calc(16 * var(--u));
  box-sizing: border-box;
  min-height: 0;
  padding: calc(32 * var(--u)) calc(20 * var(--u)) calc(14 * var(--u));
  border: calc(3 * var(--u)) solid var(--black);
  border-radius: calc(16 * var(--u));
  color: var(--black-900);
  background: var(--gray-200);
}

.cform__close {
  position: absolute;
  top: calc(20 * var(--u));
  right: calc(20 * var(--u));
  display: block;
  width: calc(32 * var(--u));
  height: calc(32 * var(--u));
  padding: 0;
  border: 0;
  color: var(--navy-400);
  background: none;
  cursor: var(--cursor-pointer);
  transition: color 0.2s var(--transition-timing);
}

.cform__close:hover {
  color: var(--navy-100);
}

.cform__close svg {
  display: block;
  width: 100%;
  height: 100%;
}

.cform__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(6 * var(--u));
  text-align: center;
}

.cform__mark {
  width: calc(115 * var(--u));
  height: calc(59 * var(--u));
  object-fit: contain;
}

.cform__title {
  margin: 0;
  color: var(--navy-100);
  font-family: var(--font-mono);
  font-size: calc(32 * var(--u));
  font-weight: 500;
  line-height: 1.6;
}

.cform__lead {
  margin: 0;
  max-width: calc(434 * var(--u));
  color: var(--black-900);
  font-family: var(--font-mono);
  font-size: calc(16 * var(--u));
  font-weight: 500;
  line-height: 1.6;
}

.cform__fields {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: calc(8 * var(--u));
  min-height: 0;
}

.cform__field {
  display: flex;
  flex-direction: column;
  gap: calc(6 * var(--u));
}

.cform__field--grow {
  flex: 1;
  min-height: 0;
}

.cform__field.is-error,
.cform__consent.is-error {
  --cform-border: var(--red-200);
  --cform-state: var(--red-200);
}

.cform__field.is-success {
  --cform-border: var(--green-100);
  --cform-state: var(--green-100);
}

.cform__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: calc(12 * var(--u));
}

.cform__label {
  color: var(--navy-100);
  font-family: var(--font-mono);
  font-size: calc(16 * var(--u));
  font-weight: 500;
  line-height: 1.6;
}

.cform__note {
  margin: 0;
  color: var(--cform-state);
  font-family: var(--font-mono);
  font-size: calc(12 * var(--u));
  font-weight: 500;
  line-height: 1.6;
  text-align: right;
}

.cform__control {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.cform__input {
  box-sizing: border-box;
  width: 100%;
  height: calc(42 * var(--u));
  padding: calc(10 * var(--u));
  border: 1px solid var(--cform-border);
  border-radius: calc(8 * var(--u));
  color: var(--navy-100);
  background: transparent;
  font-family: var(--font-mono);
  font-size: calc(14 * var(--u));
  font-weight: 500;
  line-height: 1.6;
  transition: border-color 0.2s var(--transition-timing);
}

.cform__input::placeholder {
  color: var(--gray-600);
}

.cform__input:focus-visible {
  outline: calc(2 * var(--u)) solid var(--navy-300);
  outline-offset: 1px;
}

.cform__input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cform__field.is-error .cform__input,
.cform__field.is-success .cform__input {
  padding-right: calc(38 * var(--u));
}

.cform__field.is-error .cform__input--select,
.cform__field.is-success .cform__input--select {
  padding-right: calc(60 * var(--u));
  background-position: right calc(38 * var(--u)) center;
}

.cform__input--select {
  appearance: none;
  padding-right: calc(32 * var(--u));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='9' viewBox='0 0 15 9' fill='none'%3E%3Cpath d='M1.25 1.25L7.5 7.25L13.75 1.25' stroke='%23000078' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right calc(10 * var(--u)) center;
  background-size: calc(15 * var(--u)) calc(9 * var(--u));
  cursor: var(--cursor-pointer);
}

.cform__input--select.is-placeholder {
  color: var(--gray-600);
}

.cform__input--select option {
  color: var(--navy-100);
  background: var(--gray-200);
}

.cform__input--area {
  flex: 1;
  height: auto;
  min-height: calc(120 * var(--u));
  padding: calc(10 * var(--u)) calc(6 * var(--u)) calc(6 * var(--u))
    calc(10 * var(--u));
  resize: none;
}

.cform__mark-state,
.cform__grip {
  position: absolute;
  right: calc(10 * var(--u));
  display: block;
  pointer-events: none;
}

.cform__mark-state {
  top: calc(11 * var(--u));
  width: calc(20 * var(--u));
  height: calc(20 * var(--u));
  color: var(--cform-state);
}

.cform__grip {
  right: calc(6 * var(--u));
  bottom: calc(6 * var(--u));
  width: calc(13 * var(--u));
  height: calc(13 * var(--u));
  color: var(--navy-200);
}

.cform__mark-state svg,
.cform__grip svg {
  display: block;
  width: 100%;
  height: 100%;
}

.cform__trap {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.cform__consent {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: calc(10 * var(--u));
}

.cform__checkbox {
  appearance: none;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: calc(5 * var(--u)) 0 0;
  width: calc(20 * var(--u));
  height: calc(20 * var(--u));
  border: 1px solid var(--cform-border);
  border-radius: calc(4 * var(--u));
  background: transparent;
  cursor: var(--cursor-pointer);
}

.cform__checkbox:checked {
  border-color: var(--navy-200);
  background: var(--navy-200)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='10' viewBox='0 0 12 10' fill='none'%3E%3Cpath d='M1 5.2L4.3 8.5L11 1.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / calc(12 * var(--u)) auto no-repeat;
}

.cform__checkbox:focus-visible {
  outline: calc(2 * var(--u)) solid var(--navy-300);
  outline-offset: 1px;
}

.cform__consent-text,
.cform__error {
  margin: 0;
  font-family: var(--font-mono);
  font-size: calc(12 * var(--u));
  font-weight: 500;
  line-height: 1.6;
}

.cform__fineprint {
  margin: 0;
  color: var(--gray-600);
  font-family: var(--font-mono);
  font-size: calc(12 * var(--u));
  font-weight: 500;
  line-height: 1.6;
  text-align: center;
}

.cform__consent-text {
  cursor: var(--cursor-pointer);
}

.cform__consent .cform__note {
  position: absolute;
  right: 0;
  bottom: 0;
  text-align: right;
}

.cform__link {
  color: var(--navy-300);
  text-decoration: underline;
}

.cform__submit-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(8 * var(--u));
}

.cform__submit {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(14 * var(--u));
  box-sizing: border-box;
  width: 100%;
  height: calc(48 * var(--u));
  padding: calc(8 * var(--u)) calc(14 * var(--u));
  border: 1px solid var(--black);
  border-radius: calc(8 * var(--u));
  color: var(--black);
  background: var(--lime-400);
  box-shadow: var(--shadow-green);
  font-family: var(--font-mono);
  font-size: calc(16 * var(--u));
  font-weight: 600;
  cursor: var(--cursor-pointer);
  --cform-wipe: 0%;
  transition:
    --cform-wipe 0.35s var(--transition-timing),
    border-color 0.3s var(--transition-timing),
    color 0.3s var(--transition-timing),
    background-color 0.3s var(--transition-timing);
}

.cform__submit-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  width: var(--cform-wipe);
  background: var(--black);
}

.cform__submit-label {
  background: linear-gradient(
    90deg,
    var(--lime-400) var(--cform-wipe),
    var(--black) var(--cform-wipe)
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.cform__submit.is-idle:hover {
  --cform-wipe: 100%;
  border-color: var(--lime-400);
}

.cform__submit:disabled {
  cursor: var(--cursor-default);
}

.cform__submit.is-submitting {
  color: var(--lime-400);
  border-color: var(--lime-400);
  background: var(--black);
  box-shadow: none;
}

.cform__submit.is-error {
  color: var(--white);
  background: var(--red-100);
  box-shadow: var(--shadow-red);
}

.cform__submit-result {
  font-size: calc(14 * var(--u));
}

.cform__submit-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(14 * var(--u));
}

.cform-button-enter-active,
.cform-button-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.22s ease;
}

.cform-button-enter-from {
  opacity: 0;
  transform: translateY(65%);
  filter: blur(3px);
}

.cform-button-leave-to {
  opacity: 0;
  transform: translateY(-65%);
  filter: blur(3px);
}

.cform__submit-glyph {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: calc(32 * var(--u));
  height: calc(32 * var(--u));
  border-radius: calc(4 * var(--u));
  background: var(--black);
}

.cform__submit-glyph img {
  display: block;
  width: calc(19 * var(--u));
  height: auto;
}

.cform__submit-glyph img.cform__accepted-mark {
  transform: scaleX(-1);
}

.cform__spinner {
  width: calc(32 * var(--u));
  height: calc(32 * var(--u));
  animation: cform-spin 1s steps(8) infinite;
}

@keyframes cform-spin {
  to {
    transform: rotate(360deg);
  }
}

.cform__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (width < 1024px) {
  .cform {
    --u: 1px;
    width: 100%;
    height: auto;
  }

  .cform__plate {
    top: -10px;
    left: -10px;
    right: 6px;
    bottom: 6px;
    border-width: 2px;
    border-radius: 18px;
  }

  .cform__card {
    gap: 14px;
    padding: 28px 16px 16px;
    border-width: 2px;
  }

  .cform__title {
    font-size: clamp(22px, 6vw, 30px);
  }

  .cform__label-row {
    flex-wrap: wrap;
  }

  .cform__note {
    text-align: left;
  }

  .cform__consent .cform__note {
    position: static;
    display: block;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cform *,
  .cform *::before,
  .cform *::after {
    transition-duration: 0.01ms !important;
  }

  .cform__spinner {
    animation-duration: 3s;
  }
}
</style>
