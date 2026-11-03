import { createApp, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FIELD_MESSAGES } from '@/components/ui/contact-form.data.js';

const submitContact = vi.fn();
const hasContactEndpoint = vi.fn(() => false);
const fetchContactTicket = vi.fn(() => Promise.resolve('ticket-1'));

vi.mock('@/api/contact.js', () => ({
  submitContact: (...args) => submitContact(...args),
  hasContactEndpoint: () => hasContactEndpoint(),
  fetchContactTicket: () => fetchContactTicket(),
}));

const { useContactForm } = await import('./useContactForm.js');

function mountComposable() {
  let api;
  const app = createApp({
    setup() {
      api = useContactForm();
      return () => null;
    },
  });
  app.mount(document.createElement('div'));
  return { api, unmount: () => app.unmount() };
}

const VALID = {
  name: 'Alex Morgan',
  email: 'alex@morgandesign.com',
  projectType: 'UI/UX Design',
  details: 'A marketing site with a case archive.',
  consent: true,
};

let mounted;

const fill = (api, values = VALID) => Object.assign(api.values, values);

beforeEach(() => {
  hasContactEndpoint.mockReturnValue(false);
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  vi.useRealTimers();
});

describe('field state', () => {
  it('starts idle, so the panel does not open covered in red', () => {
    mounted = mountComposable();
    const { states, messages } = mounted.api;

    expect(Object.values(states.value)).toEqual([
      'idle',
      'idle',
      'idle',
      'idle',
      'idle',
    ]);
    expect(Object.values(messages.value).join('')).toBe('');
  });

  it('rules on a field once it has been touched', () => {
    mounted = mountComposable();
    const { values, touch, states, messages } = mounted.api;

    touch('email');
    expect(states.value.email).toBe('error');
    expect(messages.value.email).toBe('Please enter your email address.');

    values.email = 'alex@';
    expect(messages.value.email).toBe(FIELD_MESSAGES.email.error);

    values.email = 'alex@morgandesign.com';
    expect(states.value.email).toBe('success');
    expect(messages.value.email).toBe(FIELD_MESSAGES.email.success);
  });

  it('wants a real address, not just an @', () => {
    mounted = mountComposable();
    const { values, touch, states } = mounted.api;

    touch('email');

    for (const address of ['alex', 'alex@', 'alex@morgan', 'a b@c.com']) {
      values.email = address;
      expect(states.value.email, address).toBe('error');
    }

    values.email = 'a@b.co';
    expect(states.value.email).toBe('success');
  });
});

describe('submitting', () => {
  it('refuses an empty form and marks every field', async () => {
    mounted = mountComposable();
    const { submit, states } = mounted.api;

    await expect(submit()).resolves.toBe('invalid');
    expect(Object.values(states.value).every((s) => s === 'error')).toBe(true);
  });

  it('reaches the success state with no endpoint configured', async () => {
    vi.useFakeTimers();
    mounted = mountComposable();
    const { submit, status } = mounted.api;
    fill(mounted.api);

    await expect(submit()).resolves.toBe('sent');
    expect(status.value).toBe('submitting');
    expect(submitContact).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1200);
    expect(status.value).toBe('success');
  });

  it('sends to the endpoint when there is one', async () => {
    hasContactEndpoint.mockReturnValue(true);
    submitContact.mockResolvedValue({ ok: true });

    mounted = mountComposable();
    fill(mounted.api);

    await expect(mounted.api.submit({ page: '/' })).resolves.toBe('sent');
    expect(submitContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: VALID.email }),
      { page: '/', ticket: 'ticket-1', website: '' },
    );
    expect(mounted.api.status.value).toBe('success');
  });

  it('clears all fields and validation after showing acceptance', async () => {
    vi.useFakeTimers();
    hasContactEndpoint.mockReturnValue(true);
    submitContact.mockResolvedValue({ ok: true });
    mounted = mountComposable();
    fill(mounted.api);

    const sending = mounted.api.submit();
    expect(mounted.api.status.value).toBe('submitting');
    await vi.advanceTimersByTimeAsync(700);
    await sending;
    expect(mounted.api.status.value).toBe('success');
    await vi.advanceTimersByTimeAsync(1200);
    expect(mounted.api.status.value).toBe('idle');
    expect(mounted.api.values).toEqual({
      name: '', email: '', projectType: '', details: '', consent: false,
    });
    expect(Object.values(mounted.api.states.value).every((s) => s === 'idle')).toBe(true);
  });

  it('fetches the ticket once, however often the form opens', async () => {
    hasContactEndpoint.mockReturnValue(true);
    mounted = mountComposable();

    await Promise.all([mounted.api.prepare(), mounted.api.prepare()]);
    await mounted.api.prepare();

    expect(fetchContactTicket).toHaveBeenCalledTimes(1);
  });

  it('uses each ticket once and gets a new one after an expired ticket', async () => {
    hasContactEndpoint.mockReturnValue(true);
    fetchContactTicket
      .mockResolvedValueOnce('ticket-1')
      .mockResolvedValueOnce('ticket-2');
    submitContact.mockResolvedValueOnce({
      ok: false,
      error: 'This form has expired.',
      retry: true,
    });

    vi.useFakeTimers();
    mounted = mountComposable();
    fill(mounted.api);

    const failedSend = mounted.api.submit();
    await vi.advanceTimersByTimeAsync(700);
    await expect(failedSend).resolves.toBe('failed');
    expect(submitContact.mock.calls[0][1].ticket).toBe('ticket-1');

    await vi.advanceTimersByTimeAsync(4000);
    submitContact.mockResolvedValueOnce({ ok: true });
    const retrySend = mounted.api.submit();
    await vi.advanceTimersByTimeAsync(700);
    await expect(retrySend).resolves.toBe('sent');
    expect(submitContact.mock.calls[1][1].ticket).toBe('ticket-2');
  });

  it('passes the honeypot along for the server to judge', async () => {
    hasContactEndpoint.mockReturnValue(true);
    submitContact.mockResolvedValue({ ok: true });
    mounted = mountComposable();
    fill(mounted.api);
    mounted.api.trap.value = 'http://spam.example';

    await mounted.api.submit();
    expect(submitContact.mock.calls[0][1].website).toBe('http://spam.example');
  });

  it('shows what the server said, per field and for the form', async () => {
    hasContactEndpoint.mockReturnValue(true);
    submitContact.mockResolvedValue({
      ok: false,
      error: 'The message did not send.',
      fields: { email: 'That address does not exist' },
    });

    mounted = mountComposable();
    const { submit, states, messages, formError, onInput } = mounted.api;
    fill(mounted.api);

    await expect(submit()).resolves.toBe('failed');

    expect(states.value.email).toBe('error');
    expect(messages.value.email).toBe('That address does not exist');
    expect(formError.value).toBe('The message did not send.');

    onInput('email');
    await nextTick();
    expect(messages.value.email).toBe(FIELD_MESSAGES.email.success);
    expect(formError.value).toBe('');
  });

  it('ignores a second submit while the first is in flight', async () => {
    hasContactEndpoint.mockReturnValue(true);
    submitContact.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 5)),
    );

    mounted = mountComposable();
    fill(mounted.api);

    const first = mounted.api.submit();
    await expect(mounted.api.submit()).resolves.toBe('busy');
    await first;

    expect(submitContact).toHaveBeenCalledTimes(1);
  });
});
