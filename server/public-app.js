// The public listener: the built site and POST /api/contact. It knows nothing
// about the admin — /admin and /api/admin do not exist here.

import { createRateLimiter } from './auth.js';
import {
  HttpError,
  clientIpReader,
  errorResponder,
  readJson,
  sendJson,
  setHeaders,
  staticServer,
} from './http.js';
import { createFormTickets } from './spam.js';
import { validateContact } from './validate.js';

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function createPublicApp({
  db,
  staticDir = '',
  trustProxy = 0,
  contactLimit = { limit: 5, windowMs: 10 * 60 * 1000 },
  ticketLimit = { limit: 30, windowMs: 10 * 60 * 1000 },
  // Stored leads per hour from everyone together: a ceiling for floods
  // spread over many addresses.
  hourlyCap = 100,
  // Leads one email address may leave per day.
  perEmailDaily = 3,
  ticketMinAgeMs = 3000,
  log = console,
}) {
  const clientIp = clientIpReader(trustProxy);
  const contactLimiter = createRateLimiter(contactLimit);
  const ticketLimiter = createRateLimiter(ticketLimit);
  const globalLimiter = createRateLimiter({
    limit: hourlyCap,
    windowMs: 60 * 60 * 1000,
  });
  const tickets = createFormTickets({
    secret: db.secret('form_ticket_secret'),
    minAgeMs: ticketMinAgeMs,
  });
  const fail = errorResponder(log);
  // The site is a single-page app; its router handles every other path,
  // including showing its own 404 page.
  const serveStatic = staticServer(staticDir, () => 'index.html');

  const accepted = (res) => sendJson(res, 201, { ok: true });

  // Bots get the same answer as people, so they learn nothing from it.
  function drop(res, ip, reason) {
    log.warn?.(`[contact] dropped from ${ip}: ${reason}`);
    accepted(res);
  }

  function handleTicket(req, res) {
    if (!ticketLimiter.take(clientIp(req))) {
      throw new HttpError(429, 'Too many requests. Please try again later.');
    }
    sendJson(res, 200, { ok: true, ticket: tickets.issue() });
  }

  async function handleContact(req, res) {
    const ip = clientIp(req);
    if (!contactLimiter.take(ip)) {
      throw new HttpError(
        429,
        'Too many messages from your network. Please try again later.',
      );
    }

    const body = await readJson(req);

    // Hidden from people, irresistible to form-filling bots.
    if (typeof body.website === 'string' && body.website.trim()) {
      return drop(res, ip, 'honeypot');
    }

    const { lead, fields } = validateContact(body);
    if (fields) {
      return sendJson(res, 422, {
        ok: false,
        error: 'Please check the highlighted fields.',
        fields,
      });
    }

    // Checked after the fields, so a typo does not use up the ticket.
    const ticket = tickets.redeem(body.ticket);
    if (ticket === 'too_fast') return drop(res, ip, 'sent too fast');
    if (ticket !== 'ok') {
      log.warn?.(`[contact] ticket ${ticket} from ${ip}`);
      return sendJson(res, 400, {
        ok: false,
        error: 'This form has expired. Please press the button again.',
        retry: true,
      });
    }

    const since = new Date(Date.now() - DAY_MS).toISOString();
    if (db.hasDuplicateLead(lead.email, lead.details, since)) {
      // A double click or a resend: the first copy is already with us.
      log.info?.('[contact] duplicate ignored');
      return accepted(res);
    }
    if (db.countRecentLeadsByEmail(lead.email, since) >= perEmailDaily) {
      throw new HttpError(
        429,
        'We already have several messages from this address today and will reply soon.',
      );
    }
    if (!globalLimiter.take('all')) {
      log.warn?.('[contact] hourly cap reached');
      throw new HttpError(
        503,
        'We are receiving a lot of messages right now. Please try again in an hour.',
      );
    }

    const id = db.insertLead({
      ...lead,
      ip,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
      consentAt: new Date().toISOString(),
    });
    log.info?.(`[contact] lead #${id}`);

    accepted(res);
  }

  return async function handle(req, res) {
    setHeaders(res, HEADERS);
    try {
      const path = new URL(req.url, 'http://local').pathname;

      if (path === '/api/contact/ticket') {
        if (req.method !== 'GET') throw new HttpError(405, 'Use GET.');
        return handleTicket(req, res);
      }
      if (path === '/api/contact') {
        if (req.method !== 'POST') throw new HttpError(405, 'Use POST.');
        return await handleContact(req, res);
      }
      if (path.startsWith('/api/')) throw new HttpError(404, 'Not found.');
      return await serveStatic(req, res, path);
    } catch (error) {
      fail(res, error);
    }
  };
}
