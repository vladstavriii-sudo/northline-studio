// @vitest-environment node
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createAdminApp } from './admin-app.js';
import { hashPassword } from './auth.js';
import { openDatabase } from './db.js';
import { createPublicApp } from './public-app.js';

const LEAD = {
  name: 'Alex Morgan',
  email: 'alex@morgandesign.com',
  projectType: 'UI/UX Design',
  details: 'A marketing site with a case archive.',
  consent: true,
  page: '/',
};

const PASSWORD = 'correct horse battery';

// Straight into the database, as the contact endpoint would store it.
const insertLead = (overrides = {}) => {
  // eslint-disable-next-line no-unused-vars
  const { consent, ...stored } = LEAD;
  return db.insertLead({
    ...stored,
    ip: '',
    userAgent: '',
    consentAt: new Date().toISOString(),
    ...overrides,
  });
};
const silent = { info() {}, warn() {}, error() {} };

let db;
let servers = [];

async function listen(app) {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

const startPublic = (options = {}) =>
  listen(createPublicApp({ db, log: silent, ticketMinAgeMs: 0, ...options }));

const startAdmin = (options = {}) =>
  listen(createAdminApp({ db, log: silent, ...options }));

async function addAdmin(username, role) {
  db.addAdmin({ username, role, passwordHash: await hashPassword(PASSWORD) });
}

const json = (base, method, path, body, headers = {}) =>
  fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      origin: base,
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

async function getTicket(base, headers = {}) {
  const response = await fetch(`${base}/api/contact/ticket`, { headers });
  return (await response.json()).ticket;
}

// Sends a lead the way the form does: with a fresh ticket.
const contact = async (base, body, headers = {}) =>
  json(
    base,
    'POST',
    '/api/contact',
    { ...body, ticket: await getTicket(base, headers) },
    headers,
  );

const login = (base, username, overrides = {}, headers = {}) =>
  json(
    base,
    'POST',
    '/api/admin/login',
    { username, password: PASSWORD, ...overrides },
    headers,
  );

async function signIn(base, username) {
  const response = await login(base, username);
  expect(response.status).toBe(200);
  return response.headers.get('set-cookie').split(';')[0];
}

beforeEach(async () => {
  db = openDatabase(':memory:');
  await addAdmin('owner', 'owner');
  await addAdmin('manager', 'manager');
  await addAdmin('viewer', 'viewer');
});

afterEach(async () => {
  await Promise.all(
    servers.map((server) => new Promise((resolve) => server.close(resolve))),
  );
  servers = [];
  db.close();
});

describe('public listener', () => {
  it('stores a valid lead', async () => {
    const base = await startPublic();
    const response = await contact(base, LEAD);

    expect(response.status).toBe(201);
    const { items } = db.listLeads();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: LEAD.name, status: 'new' });
    expect(items[0].consentAt).toBeTruthy();
  });

  it('answers with per-field messages the form can show', async () => {
    const base = await startPublic();
    const response = await contact(base, {
      ...LEAD,
      email: 'nope',
      projectType: 'Something else',
      consent: false,
    });

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(Object.keys(body.fields).sort()).toEqual([
      'consent',
      'email',
      'projectType',
    ]);
    expect(db.listLeads().total).toBe(0);
  });

  it('refuses an email that would inject mailto: parameters', async () => {
    const base = await startPublic();
    for (const email of [
      'me@x.io?cc=attacker%40evil.io',
      'me@x.io&body=hi',
      'me@x.io#x',
    ]) {
      const response = await contact(base, {
        ...LEAD,
        email,
      });
      expect(response.status, email).toBe(422);
    }
  });

  it('refuses a body that is not JSON', async () => {
    const base = await startPublic();
    const response = await fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=x',
    });
    expect(response.status).toBe(415);
  });

  it('has no admin routes at all', async () => {
    const base = await startPublic();
    const response = await login(base, 'owner');
    expect(response.status).toBe(404);
  });

  it('cannot be talked out of its rate limit with a forged X-Forwarded-For', async () => {
    const base = await startPublic({
      trustProxy: 1,
      contactLimit: { limit: 2, windowMs: 60_000 },
    });

    const statuses = [];
    for (let i = 0; i < 4; i += 1) {
      const response = await contact(base, LEAD, {
        // The forged part is on the left; nginx appends the real address.
        'x-forwarded-for': `10.0.0.${i}, 203.0.113.7`,
      });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([201, 201, 429, 429]);
    expect(db.listLeads().items[0].ip).toBe('203.0.113.7');
  });

  it('sends basic security headers', async () => {
    const base = await startPublic();
    const response = await contact(base, LEAD);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});

describe('spam protection', () => {
  const stored = () => db.listLeads().total;

  it('refuses a lead without a ticket, asking the form to retry', async () => {
    const base = await startPublic();
    const response = await json(base, 'POST', '/api/contact', LEAD);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, retry: true });
    expect(stored()).toBe(0);
  });

  it('refuses a forged or reused ticket', async () => {
    const base = await startPublic();
    const ticket = await getTicket(base);
    const forged = ticket.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));

    const send = (t, details) =>
      json(base, 'POST', '/api/contact', { ...LEAD, details, ticket: t });

    expect((await send(forged, 'First message here.')).status).toBe(400);
    expect((await send(ticket, 'Second message here.')).status).toBe(201);
    expect((await send(ticket, 'Third message here.')).status).toBe(400);
    expect(stored()).toBe(1);
  });

  it('keeps the ticket when the fields need fixing', async () => {
    const base = await startPublic();
    const ticket = await getTicket(base);
    const send = (body) =>
      json(base, 'POST', '/api/contact', { ...body, ticket });

    expect((await send({ ...LEAD, email: 'nope' })).status).toBe(422);
    expect((await send(LEAD)).status).toBe(201);
  });

  it('quietly drops a form sent faster than a person could fill it', async () => {
    const base = await startPublic({ ticketMinAgeMs: 60_000 });
    const response = await contact(base, LEAD);

    expect(response.status).toBe(201);
    expect(stored()).toBe(0);
  });

  it('quietly drops a lead that filled the honeypot', async () => {
    const base = await startPublic();
    const response = await contact(base, {
      ...LEAD,
      website: 'http://spam.example',
    });

    expect(response.status).toBe(201);
    expect(stored()).toBe(0);
  });

  it('turns away links in the name, markup and link-stuffed text', async () => {
    const base = await startPublic();
    const cases = [
      [{ name: 'Cheap pills http://spam.example' }, 'name'],
      [
        { details: 'Hello <a href="http://x.example">click</a> now' },
        'details',
      ],
      [{ details: 'See [url=http://x.example]this[/url] offer' }, 'details'],
      [
        {
          details:
            'http://a.example http://b.example www.c.example https://d.example',
        },
        'details',
      ],
    ];

    for (const [change, field] of cases) {
      const response = await contact(base, { ...LEAD, ...change });
      expect(response.status).toBe(422);
      expect(Object.keys((await response.json()).fields)).toEqual([field]);
    }
    expect(stored()).toBe(0);

    const fine = await contact(base, {
      ...LEAD,
      details: 'Our current site is https://example.com, please have a look.',
    });
    expect(fine.status).toBe(201);
  });

  it('stores a repeated message once', async () => {
    const base = await startPublic();
    await contact(base, LEAD);
    const again = await contact(base, {
      ...LEAD,
      email: LEAD.email.toUpperCase(),
    });

    expect(again.status).toBe(201);
    expect(stored()).toBe(1);
  });

  it('limits how many leads one address can leave in a day', async () => {
    const base = await startPublic({ perEmailDaily: 2 });
    const statuses = [];
    for (const n of [1, 2, 3]) {
      const response = await contact(base, {
        ...LEAD,
        details: `Message number ${n} about the project.`,
      });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([201, 201, 429]);
    expect(stored()).toBe(2);
  });

  it('caps leads per hour from everyone together', async () => {
    const base = await startPublic({ hourlyCap: 1 });
    await contact(base, LEAD);
    const second = await contact(base, { ...LEAD, email: 'sam@example.org' });

    expect(second.status).toBe(503);
    expect(stored()).toBe(1);
  });

  it('accepts tickets issued before a restart', async () => {
    const before = await startPublic();
    const ticket = await getTicket(before);
    const after = await startPublic();

    const response = await json(after, 'POST', '/api/contact', {
      ...LEAD,
      ticket,
    });
    expect(response.status).toBe(201);
  });
});

describe('admin sign-in', () => {
  it('keeps leads behind a sign-in', async () => {
    const base = await startAdmin();
    const response = await fetch(`${base}/api/admin/leads`);
    expect(response.status).toBe(401);
  });

  it('refuses a wrong password or an unknown user, with one message', async () => {
    const base = await startAdmin();

    const wrongPassword = await login(base, 'owner', { password: 'nope' });
    const unknownUser = await login(base, 'nobody');

    for (const response of [wrongPassword, unknownUser]) {
      expect(response.status).toBe(401);
      expect(response.headers.get('set-cookie')).toBeNull();
    }
    expect((await wrongPassword.json()).error).toBe(
      (await unknownUser.json()).error,
    );
  });

  it('sets a Secure, HttpOnly, SameSite=Strict cookie', async () => {
    const base = await startAdmin();
    const cookie = (await login(base, 'owner')).headers.get('set-cookie');

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('Path=/api/admin');
  });

  it('limits guesses per username, whatever address they come from', async () => {
    const base = await startAdmin({
      trustProxy: 1,
      loginUserLimit: { limit: 3, windowMs: 60_000 },
    });

    const statuses = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await login(
        base,
        'owner',
        { password: 'guess' },
        { 'x-forwarded-for': `198.51.100.${i}` },
      );
      statuses.push(response.status);
    }
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it('limits guesses per address, even with a forged X-Forwarded-For', async () => {
    const base = await startAdmin({
      trustProxy: 1,
      loginIpLimit: { limit: 3, windowMs: 60_000 },
    });

    const statuses = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await login(
        base,
        `user${i}`,
        { password: 'guess' },
        { 'x-forwarded-for': `10.0.0.${i}, 203.0.113.7` },
      );
      statuses.push(response.status);
    }
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it('records failed and successful sign-ins in the audit log', async () => {
    const base = await startAdmin();
    await login(base, 'owner', { password: 'nope' });
    await signIn(base, 'owner');

    const actions = db.raw
      .prepare('SELECT actor, action FROM audit_log ORDER BY id')
      .all()
      .map((row) => `${row.actor}:${row.action}`);
    expect(actions).toEqual(['owner:login_failed', 'owner:login']);
  });

  it('ends the session on logout', async () => {
    const base = await startAdmin();
    const cookie = await signIn(base, 'owner');
    await json(base, 'POST', '/api/admin/logout', undefined, { cookie });

    const response = await fetch(`${base}/api/admin/me`, {
      headers: { cookie },
    });
    expect(response.status).toBe(401);
  });

  it('ignores a malformed cookie instead of failing', async () => {
    const base = await startAdmin();
    const response = await fetch(`${base}/api/admin/me`, {
      headers: { cookie: 'nl_admin=%E0%A4%A' },
    });
    expect(response.status).toBe(401);
  });
});

describe('admin requests from elsewhere', () => {
  let base;
  let cookie;
  let id;

  beforeEach(async () => {
    id = insertLead();
    base = await startAdmin();
    cookie = await signIn(base, 'owner');
  });

  it('refuses a state change without an Origin', async () => {
    const response = await fetch(`${base}/api/admin/leads/${id}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(response.status).toBe(403);
    expect(db.getLead(id)).not.toBeNull();
  });

  it('refuses a state change from another origin', async () => {
    const response = await json(
      base,
      'DELETE',
      `/api/admin/leads/${id}`,
      undefined,
      {
        cookie,
        origin: 'https://evil.example',
      },
    );
    expect(response.status).toBe(403);
  });

  it('does not take X-Forwarded-Host from a client when not behind a proxy', async () => {
    const response = await json(
      base,
      'DELETE',
      `/api/admin/leads/${id}`,
      undefined,
      {
        cookie,
        origin: 'https://evil.example',
        'x-forwarded-host': 'evil.example',
      },
    );
    expect(response.status).toBe(403);
  });
});

describe('roles and row access', () => {
  let base;
  let id;
  const cookies = {};

  beforeEach(async () => {
    id = insertLead({ name: '=HYPERLINK("x")' });
    base = await startAdmin();
    for (const name of ['owner', 'manager', 'viewer']) {
      cookies[name] = await signIn(base, name);
    }
  });

  const as = (name, method, path, body) =>
    json(base, method, path, body, { cookie: cookies[name] });

  it('lets a viewer read but not change anything', async () => {
    expect((await as('viewer', 'GET', '/api/admin/leads')).status).toBe(200);
    expect(
      (
        await as('viewer', 'PATCH', `/api/admin/leads/${id}`, {
          status: 'done',
        })
      ).status,
    ).toBe(403);
    expect(
      (await as('viewer', 'DELETE', `/api/admin/leads/${id}`)).status,
    ).toBe(403);
    expect((await as('viewer', 'GET', '/api/admin/leads.csv')).status).toBe(
      403,
    );
    expect(db.getLead(id).status).toBe('new');
  });

  it('lets a manager update but not delete or export', async () => {
    const patched = await as('manager', 'PATCH', `/api/admin/leads/${id}`, {
      status: 'in_progress',
      note: 'Called back',
    });
    expect(patched.status).toBe(200);
    expect(
      (await as('manager', 'DELETE', `/api/admin/leads/${id}`)).status,
    ).toBe(403);
    expect((await as('manager', 'GET', '/api/admin/leads.csv')).status).toBe(
      403,
    );

    const { history } = await (
      await as('viewer', 'GET', `/api/admin/leads/${id}/history`)
    ).json();
    expect(history[0]).toMatchObject({
      actor: 'manager',
      action: 'update',
      details: {
        status: { from: 'new', to: 'in_progress' },
        note: { from: '', to: 'Called back' },
      },
    });
  });

  it('soft-deletes: the row disappears for everyone but the owner', async () => {
    expect((await as('owner', 'DELETE', `/api/admin/leads/${id}`)).status).toBe(
      200,
    );
    expect(db.getLead(id, { includeDeleted: true })).toMatchObject({
      deletedBy: 'owner',
    });

    // Gone for the manager: not in the list, not by id, not in the trash.
    const list = await (await as('manager', 'GET', '/api/admin/leads')).json();
    expect(list.total).toBe(0);
    expect(list.counts.deleted).toBeUndefined();
    expect((await as('manager', 'GET', `/api/admin/leads/${id}`)).status).toBe(
      404,
    );
    expect(
      (await as('manager', 'GET', `/api/admin/leads/${id}/history`)).status,
    ).toBe(404);
    expect(
      (await as('manager', 'GET', '/api/admin/leads?deleted=1')).status,
    ).toBe(403);
    expect(
      (await as('manager', 'PATCH', `/api/admin/leads/${id}`, { note: 'x' }))
        .status,
    ).toBe(404);

    // Still there for the owner, read-only until restored.
    const trash = await (
      await as('owner', 'GET', '/api/admin/leads?deleted=1')
    ).json();
    expect(trash.total).toBe(1);
    expect(
      (await as('owner', 'PATCH', `/api/admin/leads/${id}`, { note: 'x' }))
        .status,
    ).toBe(409);

    expect(
      (await as('owner', 'POST', `/api/admin/leads/${id}/restore`)).status,
    ).toBe(200);
    expect((await as('manager', 'GET', `/api/admin/leads/${id}`)).status).toBe(
      200,
    );
  });

  it('exports CSV for the owner, logged, with formulas defused', async () => {
    const response = await as('owner', 'GET', '/api/admin/leads.csv');
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    const exported = db.raw
      .prepare("SELECT details FROM audit_log WHERE action = 'export_csv'")
      .get();
    expect(JSON.parse(exported.details).rows).toBe(1);
  });

  it('searches without treating % as a wildcard', () => {
    insertLead({ details: 'Budget is 100% fixed.' });
    expect(db.listLeads({ search: '%' }).total).toBe(1);
    expect(db.listLeads({ search: 'archive' }).total).toBe(1);
  });
});

describe('admin page', () => {
  it('is served with a strict Content-Security-Policy and no framing', async () => {
    const base = await startAdmin();
    const response = await fetch(`${base}/api/admin/me`);
    const csp = response.headers.get('content-security-policy');

    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it('sends / to /admin/', async () => {
    const base = await startAdmin();
    const response = await fetch(`${base}/`, { redirect: 'manual' });
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/admin/');
  });
});

describe('database file', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'nl-db-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('is readable by its owner only', () => {
    const file = join(dir, 'data', 'leads.sqlite');
    openDatabase(file).close();

    expect(statSync(join(dir, 'data')).mode & 0o777).toBe(0o700);
    expect(statSync(file).mode & 0o777).toBe(0o600);
  });

  it('migrates a database made before roles', async () => {
    const file = join(dir, 'old.sqlite');
    const old = new DatabaseSync(file);
    old.exec(`
      CREATE TABLE admins (id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT '');
      INSERT INTO admins (username, password_hash) VALUES ('early', 'x');
    `);
    old.close();

    const migrated = openDatabase(file);
    expect(migrated.findAdmin('early')).toMatchObject({ role: 'owner' });
    const columns = migrated.raw
      .prepare('PRAGMA table_info(admins)')
      .all()
      .map((c) => c.name);
    expect(columns).not.toContain('totp_secret');
    expect(migrated.listLeads().total).toBe(0);
    migrated.close();
  });
});
