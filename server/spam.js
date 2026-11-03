import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// --- Form tickets ---------------------------------------------------------------
//
// The form asks for a ticket when it opens and sends it back with the lead.
// A ticket is signed by the server, so it cannot be made up; it is good once,
// not before minAgeMs (no human fills the form in under a few seconds) and
// not after maxAgeMs. A bot that posts straight to /api/contact has none.

export function createFormTickets({
  secret,
  minAgeMs = 3000,
  maxAgeMs = 24 * 60 * 60 * 1000,
  maxUsed = 50_000,
}) {
  const used = new Map();

  const sign = (payload) =>
    createHmac('sha256', secret).update(payload).digest('base64url');

  function forget(now) {
    for (const [nonce, expiresAt] of used) {
      if (expiresAt <= now) used.delete(nonce);
    }
    for (const nonce of used.keys()) {
      if (used.size < maxUsed) break;
      used.delete(nonce);
    }
  }

  return {
    issue(now = Date.now()) {
      const payload = `${now.toString(36)}.${randomBytes(12).toString('base64url')}`;
      return `${payload}.${sign(payload)}`;
    },

    // 'ok' | 'invalid' | 'too_fast' | 'expired' | 'reused'
    redeem(ticket, now = Date.now()) {
      const parts = typeof ticket === 'string' ? ticket.split('.') : [];
      if (parts.length !== 3) return 'invalid';

      const [time, nonce, signature] = parts;
      const expected = Buffer.from(sign(`${time}.${nonce}`));
      const given = Buffer.from(signature);
      if (
        expected.length !== given.length ||
        !timingSafeEqual(expected, given)
      ) {
        return 'invalid';
      }

      const issuedAt = parseInt(time, 36);
      if (!Number.isFinite(issuedAt)) return 'invalid';
      if (now - issuedAt < minAgeMs) return 'too_fast';
      if (now - issuedAt > maxAgeMs) return 'expired';
      if (used.has(nonce)) return 'reused';

      if (used.size >= maxUsed) forget(now);
      used.set(nonce, issuedAt + maxAgeMs);
      return 'ok';
    },
  };
}
