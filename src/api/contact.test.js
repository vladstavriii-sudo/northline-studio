import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadWith(endpoint) {
  vi.resetModules();
  vi.stubEnv('VITE_CONTACT_ENDPOINT', endpoint);
  return import('./contact.js');
}

const VALUES = {
  name: 'Alex Morgan',
  email: 'alex@morgandesign.com',
  projectType: 'UI/UX Design',
  details: 'A marketing site with a case archive.',
  consent: true,
};

const jsonResponse = (body, ok = true) => ({
  ok,
  json: () => Promise.resolve(body),
});

describe('submitContact', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports no endpoint rather than throwing when none is configured', async () => {
    const { submitContact, hasContactEndpoint } = await loadWith('');

    expect(hasContactEndpoint()).toBe(false);
    await expect(submitContact(VALUES)).resolves.toMatchObject({ ok: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts the values as JSON, with the page they came from', async () => {
    const { submitContact } = await loadWith('https://api.example.com/contact');
    fetch.mockResolvedValue(jsonResponse({ ok: true }));

    const result = await submitContact(VALUES, { page: '/project/tervex' });

    expect(result).toEqual({ ok: true });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/contact');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({
      ...VALUES,
      page: '/project/tervex',
    });
  });

  it('passes the server’s per-field messages through', async () => {
    const { submitContact } = await loadWith('https://api.example.com/contact');
    fetch.mockResolvedValue(
      jsonResponse(
        { ok: false, fields: { email: 'That address does not exist' } },
        false,
      ),
    );

    const result = await submitContact(VALUES);

    expect(result.ok).toBe(false);
    expect(result.fields).toEqual({ email: 'That address does not exist' });
  });

  it('treats a 200 that says ok:false as a failure', async () => {
    const { submitContact } = await loadWith('https://api.example.com/contact');
    fetch.mockResolvedValue(jsonResponse({ ok: false, error: 'Try later' }));

    await expect(submitContact(VALUES)).resolves.toEqual({
      ok: false,
      error: 'Try later',
      fields: undefined,
    });
  });

  it('never leaks a transport failure to the visitor', async () => {
    const { submitContact } = await loadWith('https://api.example.com/contact');
    fetch.mockRejectedValue(new Error('ECONNREFUSED 10.0.0.1:8080'));

    const result = await submitContact(VALUES);

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain('ECONNREFUSED');
  });

  it('survives a response that is not JSON', async () => {
    const { submitContact } = await loadWith('https://api.example.com/contact');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    });

    await expect(submitContact(VALUES)).resolves.toMatchObject({ ok: false });
  });
});
