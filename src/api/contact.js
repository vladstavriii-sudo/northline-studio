const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '';

const TIMEOUT_MS = 15000;

export const hasContactEndpoint = () => Boolean(ENDPOINT);

const failure = (error, fields, retry = false) => ({
  ok: false,
  error,
  fields,
  ...(retry && { retry }),
});

const GENERIC_ERROR = 'The message did not send. Please try again.';

// A one-time ticket the server signs when the form opens. Without it the
// server refuses the message, which keeps out bots that post directly.
// Fails quietly: the submit then reports the problem.
export async function fetchContactTicket() {
  if (!ENDPOINT) return '';
  try {
    const response = await fetch(`${ENDPOINT}/ticket`, {
      headers: { Accept: 'application/json' },
    });
    const body = await response.json().catch(() => null);
    return response.ok && typeof body?.ticket === 'string' ? body.ticket : '';
  } catch {
    return '';
  }
}

// `ticket` comes from fetchContactTicket; `website` is the hidden field only
// bots fill in.
export async function submitContact(
  values,
  { page = '', ticket, website } = {},
) {
  if (!ENDPOINT) {
    return failure('No contact endpoint is configured.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, page, ticket, website }),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.ok) {
      return failure(
        body?.error || GENERIC_ERROR,
        body?.fields,
        body?.retry === true,
      );
    }

    return { ok: true };
  } catch {
    return failure(GENERIC_ERROR);
  } finally {
    clearTimeout(timer);
  }
}
