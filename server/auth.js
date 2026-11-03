import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const SESSION_COOKIE = 'nl_admin';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const PASSWORD_MIN = 12;

// --- Passwords -------------------------------------------------------------

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;

  const key = await scryptAsync(
    password,
    Buffer.from(salt, 'base64'),
    KEY_LENGTH,
    SCRYPT,
  );
  const want = Buffer.from(expected, 'base64');
  return want.length === key.length && timingSafeEqual(want, key);
}

let dummyHash = null;

// Spends the same scrypt time on unknown usernames, so response timing does
// not reveal which usernames exist.
export async function burnPasswordCheck(password) {
  dummyHash ??= await hashPassword(randomBytes(16).toString('hex'));
  await verifyPassword(password, dummyHash);
  return false;
}

// Each scrypt check holds ~32 MB for ~100 ms. Capping how many run at once
// keeps a burst of sign-in requests from exhausting memory or CPU.
export function createSemaphore(max) {
  let active = 0;
  return {
    tryAcquire() {
      if (active >= max) return null;
      active += 1;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          active -= 1;
        }
      };
    },
  };
}

// --- Sessions ----------------------------------------------------------------

export const newSessionToken = () => randomBytes(32).toString('base64url');

export const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

export function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const at = part.indexOf('=');
    if (at < 0) continue;
    const key = part.slice(0, at).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(part.slice(at + 1).trim());
    } catch {
      /* a malformed cookie is ignored, not fatal */
    }
  }
  return cookies;
}

export function sessionCookie(token, { secure, maxAgeMs = SESSION_TTL_MS }) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/api/admin',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}

export const clearedSessionCookie = ({ secure }) =>
  sessionCookie('', { secure, maxAgeMs: 0 });

// --- Rate limiting -------------------------------------------------------------

// Fixed-window counter per key (an IP or a username). In memory: it resets on
// restart, which is fine for slowing down guessing and form spam. The key
// count is capped, so a flood of distinct keys cannot grow it without bound.
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }) {
  const hits = new Map();

  function prune(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
    // Still full of live keys: drop the oldest windows first.
    for (const key of hits.keys()) {
      if (hits.size < maxKeys) break;
      hits.delete(key);
    }
  }

  return {
    // Counts one attempt; false once the key is over its limit.
    take(key) {
      const now = Date.now();
      const entry = hits.get(key);

      if (!entry || entry.resetAt <= now) {
        if (hits.size >= maxKeys) prune(now);
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      entry.count += 1;
      return entry.count <= limit;
    },

    reset(key) {
      hits.delete(key);
    },
  };
}
