// The admin listener: the admin page and /api/admin. Bound to 127.0.0.1 by
// default, so it is reachable only through an SSH tunnel or a reverse proxy
// that restricts who may connect (see README).

import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  burnPasswordCheck,
  clearedSessionCookie,
  createRateLimiter,
  createSemaphore,
  hashToken,
  newSessionToken,
  parseCookies,
  sessionCookie,
  verifyPassword,
} from './auth.js';
import { LEAD_STATUSES } from './db.js';
import {
  HttpError,
  clientIpReader,
  errorResponder,
  readJson,
  sendJson,
  setHeaders,
  staticServer,
} from './http.js';

const PAGE_SIZE = 50;
const NOTE_LIMIT = 5000;

// What each role may do. Row rules live in db.js: deleted leads are hidden
// from every query unless the caller holds 'trash'.
export const PERMISSIONS = {
  viewer: ['read'],
  manager: ['read', 'update'],
  owner: ['read', 'update', 'delete', 'restore', 'trash', 'export'],
};

const HEADERS = {
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Robots-Tag': 'noindex, nofollow',
};

// Lets Excel detect UTF-8 in the CSV export.
const BOM = String.fromCharCode(0xfeff);

const WRONG_CREDENTIALS = 'Wrong username or password.';

const csvCell = (value) => {
  let s = String(value ?? '');
  // Keeps spreadsheet apps from evaluating a cell as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// For log lines: quoted and escaped, so input cannot forge new lines.
const quote = (value) => JSON.stringify(String(value).slice(0, 64));

export function createAdminApp({
  db,
  staticDir = '',
  trustProxy = 0,
  secureCookies = true,
  loginIpLimit = { limit: 10, windowMs: 15 * 60 * 1000 },
  loginUserLimit = { limit: 10, windowMs: 15 * 60 * 1000 },
  maxPasswordChecks = 4,
  log = console,
}) {
  const clientIp = clientIpReader(trustProxy);
  const ipLimiter = createRateLimiter(loginIpLimit);
  const userLimiter = createRateLimiter(loginUserLimit);
  const passwordChecks = createSemaphore(maxPasswordChecks);
  const fail = errorResponder(log);
  const serveStatic = staticServer(staticDir, (path) =>
    path === '/admin' || path.startsWith('/admin/') ? 'index.html' : null,
  );

  // Every state-changing call must say where it came from, and that must be
  // this host. SameSite=Strict already keeps the cookie off cross-site
  // requests; this is the second lock.
  function assertSameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) throw new HttpError(403, 'Missing Origin header.');

    let host = '';
    try {
      host = new URL(origin).host;
    } catch {
      /* falls through to the rejection below */
    }
    const forwarded = trustProxy ? req.headers['x-forwarded-host'] : '';
    const expected = String(forwarded || req.headers.host || '')
      .split(',')[0]
      .trim();
    if (!host || host !== expected) {
      throw new HttpError(403, 'Cross-site request refused.');
    }
  }

  function currentAdmin(req) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (!token) return null;
    const tokenHash = hashToken(token);
    const admin = db.findSession(tokenHash);
    if (!admin) return null;
    const permissions = new Set(PERMISSIONS[admin.role] || []);
    return { ...admin, tokenHash, can: (p) => permissions.has(p) };
  }

  function requireAdmin(req) {
    const admin = currentAdmin(req);
    if (!admin) throw new HttpError(401, 'Sign in to continue.');
    return admin;
  }

  function allow(admin, permission) {
    if (!admin.can(permission)) {
      throw new HttpError(403, 'Your role does not allow this.');
    }
  }

  function leadId(raw) {
    const id = Number(raw);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new HttpError(404, 'No such lead.');
    }
    return id;
  }

  function listQuery(url) {
    const status = url.searchParams.get('status') || '';
    if (status && !LEAD_STATUSES.includes(status)) {
      throw new HttpError(400, 'Unknown status.');
    }
    return {
      status,
      search: (url.searchParams.get('q') || '').trim().slice(0, 200),
    };
  }

  async function handleLogin(req, res) {
    assertSameOrigin(req);
    const ip = clientIp(req);
    const body = await readJson(req);

    const username =
      typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (
      !username ||
      !password ||
      username.length > 64 ||
      password.length > 1024
    ) {
      throw new HttpError(400, 'Enter a username and a password.');
    }

    // Both counters advance before the check, so parallel requests cannot
    // slip past them; a success clears them.
    const userKey = username.toLowerCase();
    const ipOk = ipLimiter.take(ip);
    const userOk = userLimiter.take(userKey);
    if (!ipOk || !userOk) {
      log.warn?.(`[admin] sign-in throttled for ${quote(username)} from ${ip}`);
      throw new HttpError(
        429,
        'Too many attempts. Try again in a few minutes.',
      );
    }

    const release = passwordChecks.tryAcquire();
    if (!release) throw new HttpError(503, 'Busy. Try again in a moment.');

    let admin;
    let reason = '';
    try {
      admin = db.findAdmin(username);
      const passwordOk = admin
        ? await verifyPassword(password, admin.passwordHash)
        : await burnPasswordCheck(password);

      if (!passwordOk) reason = admin ? 'password' : 'unknown user';
    } finally {
      release();
    }

    if (reason) {
      log.warn?.(
        `[admin] failed sign-in for ${quote(username)} from ${ip}: ${reason}`,
      );
      db.audit({
        actor: username,
        action: 'login_failed',
        ip,
        details: { reason },
      });
      throw new HttpError(401, WRONG_CREDENTIALS);
    }

    ipLimiter.reset(ip);
    userLimiter.reset(userKey);
    const token = newSessionToken();
    db.createSession(hashToken(token), admin.id, Date.now() + SESSION_TTL_MS);
    db.audit({ actor: admin.username, action: 'login', ip });

    sendJson(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': sessionCookie(token, { secure: secureCookies }) },
    );
  }

  async function handleApi(req, res, path) {
    if (path === '/api/admin/login') {
      if (req.method !== 'POST') throw new HttpError(405, 'Use POST.');
      return handleLogin(req, res);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') assertSameOrigin(req);
    const admin = requireAdmin(req);
    const ip = clientIp(req);
    const audit = (action, leadId = null, details = {}) =>
      db.audit({ actor: admin.username, action, leadId, ip, details });
    const url = new URL(req.url, 'http://local');

    if (path === '/api/admin/me' && req.method === 'GET') {
      return sendJson(res, 200, {
        ok: true,
        username: admin.username,
        role: admin.role,
        permissions: PERMISSIONS[admin.role] || [],
      });
    }

    if (path === '/api/admin/logout' && req.method === 'POST') {
      db.deleteSession(admin.tokenHash);
      audit('logout');
      return sendJson(
        res,
        200,
        { ok: true },
        { 'Set-Cookie': clearedSessionCookie({ secure: secureCookies }) },
      );
    }

    if (path === '/api/admin/leads' && req.method === 'GET') {
      allow(admin, 'read');
      const deleted = url.searchParams.get('deleted') === '1';
      if (deleted) allow(admin, 'trash');

      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const { items, total } = db.listLeads({
        ...listQuery(url),
        deleted,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      const counts = db.countByStatus();
      if (!admin.can('trash')) delete counts.deleted;

      return sendJson(res, 200, {
        ok: true,
        items,
        total,
        page,
        pageSize: PAGE_SIZE,
        counts,
      });
    }

    if (path === '/api/admin/leads.csv' && req.method === 'GET') {
      allow(admin, 'export');
      const query = listQuery(url);
      const { items } = db.listLeads({ ...query, limit: -1 });
      audit('export_csv', null, { ...query, rows: items.length });

      const columns = [
        'id',
        'createdAt',
        'status',
        'name',
        'email',
        'projectType',
        'details',
        'note',
        'page',
      ];
      const csv = [
        columns.join(','),
        ...items.map((lead) => columns.map((c) => csvCell(lead[c])).join(',')),
      ].join('\r\n');
      const date = new Date().toISOString().slice(0, 10);
      return sendJson(res, 200, `${BOM}${csv}\r\n`, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${date}.csv"`,
      });
    }

    const match = path.match(/^\/api\/admin\/leads\/([^/]+)(\/[a-z]+)?$/);
    if (!match) throw new HttpError(404, 'Not found.');

    const id = leadId(match[1]);
    const action = match[2] || '';

    // A deleted lead exists only for those allowed to see the trash; for
    // everyone else it is indistinguishable from one that never existed.
    const findLead = () => {
      const lead = db.getLead(id, { includeDeleted: admin.can('trash') });
      if (!lead) throw new HttpError(404, 'No such lead.');
      return lead;
    };

    if (action === '' && req.method === 'GET') {
      allow(admin, 'read');
      return sendJson(res, 200, { ok: true, lead: findLead() });
    }

    if (action === '/history' && req.method === 'GET') {
      allow(admin, 'read');
      findLead();
      return sendJson(res, 200, { ok: true, history: db.leadHistory(id) });
    }

    if (action === '' && req.method === 'PATCH') {
      allow(admin, 'update');
      const body = await readJson(req);
      const changes = {};

      if (body.status !== undefined) {
        if (!LEAD_STATUSES.includes(body.status)) {
          throw new HttpError(400, 'Unknown status.');
        }
        changes.status = body.status;
      }
      if (body.note !== undefined) {
        if (typeof body.note !== 'string' || body.note.length > NOTE_LIMIT) {
          throw new HttpError(
            400,
            `Notes are limited to ${NOTE_LIMIT} characters.`,
          );
        }
        changes.note = body.note;
      }

      const before = findLead();
      if (before.deletedAt) throw new HttpError(409, 'Restore the lead first.');

      const after = db.updateLead(id, changes);
      const diff = {};
      for (const key of Object.keys(changes)) {
        if (before[key] !== after[key]) {
          diff[key] = { from: before[key], to: after[key] };
        }
      }
      if (Object.keys(diff).length) audit('update', id, diff);

      return sendJson(res, 200, { ok: true, lead: after });
    }

    if (action === '' && req.method === 'DELETE') {
      allow(admin, 'delete');
      if (!db.softDeleteLead(id, admin.username)) {
        throw new HttpError(404, 'No such lead.');
      }
      audit('delete', id);
      return sendJson(res, 200, { ok: true });
    }

    if (action === '/restore' && req.method === 'POST') {
      allow(admin, 'restore');
      if (!db.restoreLead(id)) throw new HttpError(404, 'No such lead.');
      audit('restore', id);
      return sendJson(res, 200, { ok: true, lead: db.getLead(id) });
    }

    throw new HttpError(404, 'Not found.');
  }

  return async function handle(req, res) {
    setHeaders(res, HEADERS);
    try {
      const path = new URL(req.url, 'http://local').pathname;

      if (path.startsWith('/api/admin/')) {
        return await handleApi(req, res, path);
      }
      if (path === '/' && ['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(302, { Location: '/admin/' });
        return res.end();
      }
      if (path.startsWith('/api/')) throw new HttpError(404, 'Not found.');
      return await serveStatic(req, res, path);
    } catch (error) {
      fail(res, error);
    }
  };
}
