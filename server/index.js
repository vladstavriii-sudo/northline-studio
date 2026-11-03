import { existsSync } from 'node:fs';
import { createServer } from 'node:http';

import { createAdminApp } from './admin-app.js';
import { config } from './config.js';
import { openDatabase } from './db.js';
import { createPublicApp } from './public-app.js';

// Files this process creates (the database, its WAL) are private to it.
process.umask(0o077);

const db = openDatabase(config.databasePath);

const admins = db.listAdmins();
if (!admins.length) {
  console.warn(
    '[admin] No admin account yet. Create one with: npm run admin -- add <username>',
  );
}
if (!config.secureCookies) {
  console.warn('[admin] COOKIE_SECURE is off: use this only on localhost.');
}

const dirOrNone = (dir) => (dir && existsSync(dir) ? dir : '');

const servers = [
  {
    name: 'site',
    host: config.host,
    port: config.port,
    staticDir: dirOrNone(config.staticDir),
    app: (staticDir) =>
      createPublicApp({ db, staticDir, trustProxy: config.trustProxy }),
  },
  {
    name: 'admin',
    host: config.adminHost,
    port: config.adminPort,
    staticDir: dirOrNone(config.adminStaticDir),
    app: (staticDir) =>
      createAdminApp({
        db,
        staticDir,
        trustProxy: config.trustProxy,
        secureCookies: config.secureCookies,
      }),
  },
].map(({ name, host, port, staticDir, app }) => {
  const server = createServer(app(staticDir));
  server.listen(port, host, () => {
    console.info(
      `[${name}] http://${host}:${port}` +
        (staticDir ? ` — serving ${staticDir}` : ' — API only (not built)'),
    );
  });
  return server;
});

console.info(`[server] database: ${config.databasePath}`);

if (!['127.0.0.1', '::1', 'localhost'].includes(config.adminHost)) {
  console.warn(
    `[admin] listening on ${config.adminHost}: make sure a firewall or proxy restricts who can reach it.`,
  );
}

function shutdown() {
  let open = servers.length;
  for (const server of servers) {
    server.close(() => {
      open -= 1;
      if (!open) {
        db.close();
        process.exit(0);
      }
    });
    server.closeAllConnections();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
