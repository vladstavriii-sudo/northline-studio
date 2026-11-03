// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createRateLimiter, parseCookies } from './auth.js';

describe('createRateLimiter', () => {
  it('stays bounded under a flood of distinct keys', () => {
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 60_000,
      maxKeys: 100,
    });
    for (let i = 0; i < 1000; i += 1) limiter.take(`10.0.${i >> 8}.${i & 255}`);
    // The newest key still counts.
    expect(limiter.take('10.0.3.231')).toBe(false);
  });
});

describe('parseCookies', () => {
  it('ignores a malformed value instead of throwing', () => {
    expect(parseCookies('a=%E0%A4%A; b=ok')).toEqual({ b: 'ok' });
  });
});
