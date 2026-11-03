import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import {
  fetchContactTicket,
  hasContactEndpoint,
  submitContact,
} from '@/api/contact.js';
import { FIELD_MESSAGES } from '@/components/ui/contact-form.data.js';
import {
  FIELD_NAMES,
  validateField,
} from '@/components/ui/contact-form.rules.js';

const EMPTY_VALUES = {
  name: '',
  email: '',
  projectType: '',
  details: '',
  consent: false,
};

const RESET_AFTER = 4000;
const SUCCESS_HOLD_MS = 1200;
const FAKE_SEND = 1100;
const MIN_SEND_MS = 700;

export function useContactForm() {
  const status = ref('idle');
  const values = reactive({ ...EMPTY_VALUES });
  const touched = reactive({});
  const serverFields = reactive({});
  const formError = ref('');
  // The hidden honeypot field; people never see it, so it stays empty.
  const trap = ref('');

  // One-time ticket from the server, fetched when the form opens.
  let ticket = '';
  let ticketRequest = null;

  let resolveTimer = null;
  let resetTimer = null;

  const isLocked = computed(() => status.value !== 'idle');

  // The same rules the server applies, so a message that would come back
  // from it shows up here first, worded the same way.
  const errors = computed(() =>
    Object.fromEntries(
      FIELD_NAMES.map((name) => [name, validateField(name, values)]),
    ),
  );

  const states = computed(() =>
    Object.fromEntries(
      FIELD_NAMES.map((name) => {
        if (serverFields[name]) return [name, 'error'];
        if (!touched[name]) return [name, 'idle'];
        return [name, errors.value[name] ? 'error' : 'success'];
      }),
    ),
  );

  const messages = computed(() =>
    Object.fromEntries(
      FIELD_NAMES.map((name) => {
        if (serverFields[name]) return [name, serverFields[name]];
        const state = states.value[name];
        if (state === 'idle') return [name, ''];
        return [
          name,
          state === 'error' ? errors.value[name] : FIELD_MESSAGES[name].success,
        ];
      }),
    ),
  );

  const isValid = computed(() =>
    FIELD_NAMES.every((name) => !errors.value[name]),
  );

  function clearTimers() {
    clearTimeout(resolveTimer);
    clearTimeout(resetTimer);
  }

  function clearServerFields() {
    FIELD_NAMES.forEach((name) => delete serverFields[name]);
  }

  function reset() {
    clearTimers();
    Object.assign(values, EMPTY_VALUES);
    Object.keys(touched).forEach((key) => delete touched[key]);
    clearServerFields();
    formError.value = '';
    status.value = 'idle';
  }

  function succeed() {
    clearTimers();
    status.value = 'success';
    resetTimer = setTimeout(reset, SUCCESS_HOLD_MS);
  }

  function fail({ error = '', fields } = {}) {
    clearTimers();
    status.value = 'error';
    formError.value = error;
    if (fields) Object.assign(serverFields, fields);
    resetTimer = setTimeout(() => {
      status.value = 'idle';
    }, RESET_AFTER);
  }

  // Gets a ticket if there is none yet. Safe to call repeatedly.
  function prepare() {
    if (!hasContactEndpoint() || ticket) return Promise.resolve();
    ticketRequest ??= fetchContactTicket().then((value) => {
      ticket = value;
      ticketRequest = null;
    });
    return ticketRequest;
  }

  function touch(name) {
    touched[name] = true;
  }

  function onInput(name, immediate = false) {
    if (serverFields[name]) delete serverFields[name];
    if (formError.value) formError.value = '';
    if (immediate) touch(name);
  }

  async function submit({ page = '' } = {}) {
    if (status.value !== 'idle') return 'busy';

    clearServerFields();
    FIELD_NAMES.forEach(touch);

    if (!isValid.value) return 'invalid';

    status.value = 'submitting';
    const startedAt = Date.now();

    if (!hasContactEndpoint()) {
      resolveTimer = setTimeout(succeed, FAKE_SEND);
      return 'sent';
    }

    await prepare();
    const result = await submitContact(
      { ...values },
      { page, ticket, website: trap.value },
    );
    const remaining = MIN_SEND_MS - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => {
        resolveTimer = setTimeout(resolve, remaining);
      });
    }
    // Tickets are single-use, whatever the outcome.
    ticket = '';

    if (result.ok) {
      succeed();
      return 'sent';
    }

    fail(result);
    // An expired ticket: have a fresh one ready for the next press.
    if (result.retry) prepare();
    return 'failed';
  }

  onBeforeUnmount(clearTimers);

  return {
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
  };
}
