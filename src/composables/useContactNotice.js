import { ref } from 'vue';

// What the visitor sees once the form has closed after a successful send.
// One notice for the whole app, whichever form sent the message.

const AUTO_HIDE_MS = 9000;

const notice = ref(null);
let hideTimer = 0;

function dismiss() {
  clearTimeout(hideTimer);
  notice.value = null;
}

function show({ name = '', email = '' } = {}) {
  clearTimeout(hideTimer);
  notice.value = { name: name.split(/\s+/)[0] || '', email, at: Date.now() };
  hideTimer = setTimeout(dismiss, AUTO_HIDE_MS);
}

// Hovering or focusing the notice keeps it up while it is being read.
function hold() {
  clearTimeout(hideTimer);
}

function release() {
  if (!notice.value) return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(dismiss, AUTO_HIDE_MS / 2);
}

export function useContactNotice() {
  return { notice, show, dismiss, hold, release };
}
