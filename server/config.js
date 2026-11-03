import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const flag = (value, fallback) =>
  value === undefined || value === ''
    ? fallback
    : /^(1|true|yes)$/i.test(value);

const env = process.env;

export const config = {
  // The public site and the contact endpoint.
  port: Number(env.SERVER_PORT) || 8787,
  host: env.SERVER_HOST || '127.0.0.1',
  staticDir: env.STATIC_DIR ?? `${projectRoot}dist`,

  // The admin: a separate listener, so it can stay off the public internet.
  adminPort: Number(env.ADMIN_PORT) || 8788,
  adminHost: env.ADMIN_HOST || '127.0.0.1',
  adminStaticDir: env.ADMIN_STATIC_DIR ?? `${projectRoot}dist-admin`,

  databasePath: env.DATABASE_PATH || `${projectRoot}data/leads.sqlite`,

  // How many reverse proxies sit in front (aaPanel's nginx = 1). The client
  // IP is read from that many entries from the right of X-Forwarded-For —
  // never from the left, which the client writes itself.
  trustProxy: Math.max(0, Number(env.TRUST_PROXY) || 0),

  // Secure cookies by default. Turn off only for plain-http local use in a
  // browser that refuses Secure cookies on http://localhost (Safari).
  secureCookies: flag(env.COOKIE_SECURE, true),
};
