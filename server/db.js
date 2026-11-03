import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const LEAD_STATUSES = ['new', 'in_progress', 'done', 'archived'];
export const ROLES = ['viewer', 'manager', 'owner'];

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

// Applied in order; PRAGMA user_version records how many have run. Never edit
// a migration that has shipped — add a new one.
const MIGRATIONS = [
  `
  CREATE TABLE IF NOT EXISTS leads (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    email        TEXT    NOT NULL,
    project_type TEXT    NOT NULL,
    details      TEXT    NOT NULL,
    page         TEXT    NOT NULL DEFAULT '',
    status       TEXT    NOT NULL DEFAULT 'new',
    note         TEXT    NOT NULL DEFAULT '',
    ip           TEXT    NOT NULL DEFAULT '',
    user_agent   TEXT    NOT NULL DEFAULT '',
    consent_at   TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (${NOW}),
    updated_at   TEXT    NOT NULL DEFAULT (${NOW})
  );
  CREATE INDEX IF NOT EXISTS leads_status_created ON leads (status, created_at);

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (${NOW})
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT    PRIMARY KEY,
    admin_id   INTEGER NOT NULL REFERENCES admins (id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  `,
  `
  ALTER TABLE leads  ADD COLUMN deleted_at TEXT;
  ALTER TABLE leads  ADD COLUMN deleted_by TEXT;
  ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('viewer', 'manager', 'owner'));
  ALTER TABLE admins ADD COLUMN totp_secret TEXT;
  ALTER TABLE admins ADD COLUMN totp_last_step INTEGER NOT NULL DEFAULT 0;

  -- Sessions from before roles and 2FA existed are not trusted.
  DELETE FROM sessions;

  CREATE TABLE audit_log (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    at      TEXT    NOT NULL DEFAULT (${NOW}),
    actor   TEXT    NOT NULL,
    action  TEXT    NOT NULL,
    lead_id INTEGER,
    ip      TEXT    NOT NULL DEFAULT '',
    details TEXT    NOT NULL DEFAULT '{}'
  );
  CREATE INDEX audit_log_lead ON audit_log (lead_id, at);
  `,
  `
  -- Two-factor sign-in was dropped; its columns go with it.
  ALTER TABLE admins DROP COLUMN totp_secret;
  ALTER TABLE admins DROP COLUMN totp_last_step;
  `,
  `
  -- Server-side secrets (the form-ticket signing key), kept across restarts.
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE INDEX leads_email_created ON leads (email COLLATE NOCASE, created_at);
  `,
];

const LEAD_COLUMNS = `id, name, email, project_type AS projectType, details, page,
  status, note, ip, user_agent AS userAgent, consent_at AS consentAt,
  created_at AS createdAt, updated_at AS updatedAt,
  deleted_at AS deletedAt, deleted_by AS deletedBy`;

const ADMIN_COLUMNS = `id, username, role, password_hash AS passwordHash,
  created_at AS createdAt`;

const plain = (row) => (row ? { ...row } : null);

function migrate(db) {
  const { user_version: version } = db.prepare('PRAGMA user_version').get();
  for (let i = version; i < MIGRATIONS.length; i += 1) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

// The database holds personal data and password hashes: only the server's own
// user may read it. Applied to existing files too, in case they predate this.
function lockDown(file) {
  const dir = dirname(file);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  chmodSync(dir, 0o700);
  for (const path of [file, `${file}-wal`, `${file}-shm`]) {
    if (existsSync(path)) chmodSync(path, 0o600);
  }
}

export function openDatabase(file) {
  const onDisk = file !== ':memory:';
  if (onDisk) lockDown(file);

  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  if (onDisk) lockDown(file);

  const statements = {
    insertLead: db.prepare(`
      INSERT INTO leads (name, email, project_type, details, page, ip, user_agent, consent_at)
      VALUES (:name, :email, :projectType, :details, :page, :ip, :userAgent, :consentAt)
    `),
    getLead: db.prepare(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = ?`),
    softDeleteLead: db.prepare(`
      UPDATE leads SET deleted_at = ${NOW}, deleted_by = ?, updated_at = ${NOW}
      WHERE id = ? AND deleted_at IS NULL
    `),
    restoreLead: db.prepare(`
      UPDATE leads SET deleted_at = NULL, deleted_by = NULL, updated_at = ${NOW}
      WHERE id = ? AND deleted_at IS NOT NULL
    `),
    countRecentByEmail: db.prepare(`
      SELECT COUNT(*) AS count FROM leads
      WHERE email = ? COLLATE NOCASE AND created_at > ?
    `),
    findDuplicate: db.prepare(`
      SELECT id FROM leads
      WHERE email = ? COLLATE NOCASE AND details = ? AND created_at > ?
      LIMIT 1
    `),
    getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
    insertSetting: db.prepare(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
    ),
    countByStatus: db.prepare(`
      SELECT status, COUNT(*) AS count FROM leads
      WHERE deleted_at IS NULL GROUP BY status
    `),
    countDeleted: db.prepare(
      'SELECT COUNT(*) AS count FROM leads WHERE deleted_at IS NOT NULL',
    ),

    findAdmin: db.prepare(
      `SELECT ${ADMIN_COLUMNS} FROM admins WHERE username = ?`,
    ),
    listAdmins: db.prepare(
      `SELECT ${ADMIN_COLUMNS} FROM admins ORDER BY username`,
    ),
    insertAdmin: db.prepare(`
      INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)
    `),
    setPassword: db.prepare(
      'UPDATE admins SET password_hash = ? WHERE username = ?',
    ),
    setRole: db.prepare('UPDATE admins SET role = ? WHERE username = ?'),
    deleteAdmin: db.prepare('DELETE FROM admins WHERE username = ?'),

    insertSession: db.prepare(
      'INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)',
    ),
    findSession: db.prepare(`
      SELECT admins.id, admins.username, admins.role FROM sessions
      JOIN admins ON admins.id = sessions.admin_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    deleteAdminSessions: db.prepare(
      'DELETE FROM sessions WHERE admin_id = (SELECT id FROM admins WHERE username = ?)',
    ),
    purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),

    insertAudit: db.prepare(`
      INSERT INTO audit_log (actor, action, lead_id, ip, details)
      VALUES (:actor, :action, :leadId, :ip, :details)
    `),
    leadHistory: db.prepare(`
      SELECT id, at, actor, action, details FROM audit_log
      WHERE lead_id = ? ORDER BY at DESC, id DESC LIMIT 100
    `),
  };

  return {
    raw: db,

    // --- Leads. Every read and write takes a stance on deleted rows: they are
    // invisible unless the caller asks for them explicitly. ---

    insertLead(lead) {
      const { lastInsertRowid } = statements.insertLead.run(lead);
      return Number(lastInsertRowid);
    },

    // Spam checks look at everything sent, deleted leads included: deleting
    // a lead must not reopen the door for the same sender.
    countRecentLeadsByEmail(email, sinceIso) {
      return statements.countRecentByEmail.get(email, sinceIso).count;
    },

    hasDuplicateLead(email, details, sinceIso) {
      return Boolean(statements.findDuplicate.get(email, details, sinceIso));
    },

    getLead(id, { includeDeleted = false } = {}) {
      const lead = plain(statements.getLead.get(id));
      if (!lead || (lead.deletedAt && !includeDeleted)) return null;
      return lead;
    },

    listLeads({
      status = '',
      search = '',
      deleted = false,
      limit = 50,
      offset = 0,
    } = {}) {
      const where = [deleted ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL'];
      const params = {};

      if (status) {
        where.push('status = :status');
        params.status = status;
      } else if (!deleted) {
        where.push("status != 'archived'");
      }

      if (search) {
        where.push(
          "(name LIKE :search ESCAPE '\\' OR email LIKE :search ESCAPE '\\' OR details LIKE :search ESCAPE '\\' OR note LIKE :search ESCAPE '\\')",
        );
        params.search = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      }

      const clause = `WHERE ${where.join(' AND ')}`;
      const total = db
        .prepare(`SELECT COUNT(*) AS count FROM leads ${clause}`)
        .get(params).count;
      const items = db
        .prepare(
          `SELECT ${LEAD_COLUMNS} FROM leads ${clause}
           ORDER BY created_at DESC, id DESC LIMIT :limit OFFSET :offset`,
        )
        .all({ ...params, limit, offset })
        .map(plain);

      return { items, total };
    },

    // Only live leads can be changed; returns null for missing or deleted.
    updateLead(id, { status, note }) {
      const sets = [];
      const params = { id };

      if (status !== undefined) {
        sets.push('status = :status');
        params.status = status;
      }
      if (note !== undefined) {
        sets.push('note = :note');
        params.note = note;
      }
      if (!sets.length) return this.getLead(id);

      sets.push(`updated_at = ${NOW}`);
      db.prepare(
        `UPDATE leads SET ${sets.join(', ')} WHERE id = :id AND deleted_at IS NULL`,
      ).run(params);
      return this.getLead(id);
    },

    softDeleteLead(id, actor) {
      return statements.softDeleteLead.run(actor, id).changes > 0;
    },

    restoreLead(id) {
      return statements.restoreLead.run(id).changes > 0;
    },

    countByStatus() {
      const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
      for (const { status, count } of statements.countByStatus.all()) {
        counts[status] = count;
      }
      counts.deleted = statements.countDeleted.get().count;
      return counts;
    },

    // --- Admins ---

    findAdmin(username) {
      return plain(statements.findAdmin.get(username));
    },

    listAdmins() {
      return statements.listAdmins.all().map(plain);
    },

    addAdmin({ username, passwordHash, role }) {
      statements.insertAdmin.run(username, passwordHash, role);
    },

    // Each of these signs the admin out everywhere: credentials or rights
    // changed, so existing sessions should not outlive them.
    setPassword(username, passwordHash) {
      statements.setPassword.run(passwordHash, username);
      statements.deleteAdminSessions.run(username);
    },

    setRole(username, role) {
      statements.setRole.run(role, username);
      statements.deleteAdminSessions.run(username);
    },

    removeAdmin(username) {
      return statements.deleteAdmin.run(username).changes > 0;
    },

    // --- Sessions ---

    createSession(tokenHash, adminId, expiresAt) {
      statements.purgeSessions.run(Date.now());
      statements.insertSession.run(tokenHash, adminId, expiresAt);
    },

    findSession(tokenHash) {
      return plain(statements.findSession.get(tokenHash, Date.now()));
    },

    deleteSession(tokenHash) {
      statements.deleteSession.run(tokenHash);
    },

    // --- Settings ---

    // Returns the stored secret, creating a random one the first time.
    secret(key) {
      statements.insertSetting.run(key, randomBytes(32).toString('base64url'));
      return statements.getSetting.get(key).value;
    },

    // --- Audit ---

    audit({ actor, action, leadId = null, ip = '', details = {} }) {
      statements.insertAudit.run({
        actor: String(actor).slice(0, 64),
        action,
        leadId,
        ip,
        details: JSON.stringify(details),
      });
    },

    leadHistory(leadId) {
      return statements.leadHistory.all(leadId).map((row) => ({
        ...row,
        details: JSON.parse(row.details),
      }));
    },

    close() {
      db.close();
    },
  };
}
