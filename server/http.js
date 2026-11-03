import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const BODY_LIMIT = 32 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

export function setHeaders(res, headers) {
  for (const [name, value] of Object.entries(headers)) {
    res.setHeader(name, value);
  }
}

export async function readJson(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) {
    throw new HttpError(415, 'Expected a JSON body.');
  }

  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > BODY_LIMIT)
      throw new HttpError(413, 'The request is too large.');
    chunks.push(chunk);
  }

  if (!size) return {};
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'The request body is not valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Expected a JSON object.');
  }
  return body;
}

// With N trusted proxies in front, the client is the Nth address from the
// right of X-Forwarded-For: each proxy appends the address it saw, and
// everything to the left of that came from the client and can be forged.
export function clientIpReader(trustProxy) {
  return (req) => {
    const socketIp = req.socket.remoteAddress || '';
    if (!trustProxy) return socketIp;

    const chain = String(req.headers['x-forwarded-for'] || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    return chain[chain.length - trustProxy] || socketIp;
  };
}

export function errorResponder(log) {
  return (res, error) => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    if (error instanceof HttpError) {
      sendJson(res, error.status, {
        ok: false,
        error: error.message,
        ...error.extra,
      });
      return;
    }
    log.error?.(error);
    sendJson(res, 500, {
      ok: false,
      error: 'Something went wrong on our side.',
    });
  };
}

async function serveFile(res, file, { immutable = false, head = false } = {}) {
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return false;

  res.writeHead(200, {
    'Content-Type':
      MIME[extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': immutable
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });
  if (head) res.end();
  else createReadStream(file).pipe(res);
  return true;
}

// Serves files from root, and fallback(path) for paths without an extension
// (client-side routes). Paths cannot escape root.
export function staticServer(root, fallback) {
  const base = root ? resolve(root) : '';

  return async function serveStatic(req, res, path) {
    if (!base || !['GET', 'HEAD'].includes(req.method)) {
      throw new HttpError(404, 'Not found.');
    }
    const head = req.method === 'HEAD';

    let decoded;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      throw new HttpError(400, 'Bad path.');
    }
    const file = resolve(join(base, decoded));
    if (file !== base && !file.startsWith(base + sep)) {
      throw new HttpError(404, 'Not found.');
    }

    const immutable = decoded.startsWith('/assets/');
    if (await serveFile(res, file, { immutable, head })) return;

    // Anything with an extension is a real file that is missing.
    const page = extname(decoded) ? null : fallback(decoded);
    if (!page || !(await serveFile(res, join(base, page), { head }))) {
      throw new HttpError(404, 'Not found.');
    }
  };
}
