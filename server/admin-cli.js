// Manages admin accounts. Run on the server, as the user the site runs as:
//
//   npm run admin -- add <username> [--role owner|manager|viewer]
//   npm run admin -- passwd <username>
//   npm run admin -- role <username> <owner|manager|viewer>
//   npm run admin -- remove <username>
//   npm run admin -- list
//
// Passwords are read from the terminal without echo, or from ADMIN_PASSWORD
// when there is no terminal. Every change signs that admin out everywhere.

import { createInterface } from 'node:readline';

import { PASSWORD_MIN, hashPassword } from './auth.js';
import { config } from './config.js';
import { ROLES, openDatabase } from './db.js';

process.umask(0o077);

const USAGE = `Usage:
  npm run admin -- add <username> [--role ${ROLES.join('|')}]
  npm run admin -- passwd <username>
  npm run admin -- role <username> <${ROLES.join('|')}>
  npm run admin -- remove <username>
  npm run admin -- list`;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl._writeToOutput = (text) => {
      rl.output.write(text.startsWith(question) ? text : '');
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function readPassword() {
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (!process.stdin.isTTY) {
      throw new Error('No terminal to ask in. Set ADMIN_PASSWORD instead.');
    }
    password = await askHidden('Password: ');
    if ((await askHidden('Repeat password: ')) !== password) {
      throw new Error('The passwords do not match.');
    }
  }
  if (password.length < PASSWORD_MIN) {
    throw new Error(`Use at least ${PASSWORD_MIN} characters.`);
  }
  return password;
}

function checkUsername(username) {
  if (!/^[\w.@-]{3,64}$/.test(username || '')) {
    throw new Error('Username: 3–64 letters, digits, . _ @ -');
  }
  return username;
}

function checkRole(role) {
  if (!ROLES.includes(role)) {
    throw new Error(`Role must be one of: ${ROLES.join(', ')}`);
  }
  return role;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const db = openDatabase(config.databasePath);

  try {
    const existing = (username) => {
      const admin = db.findAdmin(checkUsername(username));
      if (!admin) throw new Error(`No admin "${username}".`);
      return admin;
    };

    switch (command) {
      case 'add': {
        const username = checkUsername(args[0]);
        if (db.findAdmin(username)) {
          throw new Error(`"${username}" exists. Use passwd or role.`);
        }
        const roleAt = args.indexOf('--role');
        const role = checkRole(
          roleAt >= 0
            ? args[roleAt + 1]
            : db.listAdmins().length
              ? 'manager'
              : 'owner',
        );
        const passwordHash = await hashPassword(await readPassword());
        db.addAdmin({ username, passwordHash, role });
        console.info(`Admin "${username}" created with role ${role}.`);
        break;
      }

      case 'passwd': {
        const { username } = existing(args[0]);
        db.setPassword(username, await hashPassword(await readPassword()));
        console.info(`Password for "${username}" changed; sessions ended.`);
        break;
      }

      case 'role': {
        const { username } = existing(args[0]);
        db.setRole(username, checkRole(args[1]));
        console.info(`"${username}" is now ${args[1]}; sessions ended.`);
        break;
      }

      case 'remove': {
        const { username, role } = existing(args[0]);
        const owners = db.listAdmins().filter((a) => a.role === 'owner');
        if (role === 'owner' && owners.length === 1) {
          throw new Error(
            'That is the last owner. Make someone else owner first.',
          );
        }
        db.removeAdmin(username);
        console.info(`Removed "${username}".`);
        break;
      }

      case 'list': {
        const admins = db.listAdmins();
        if (!admins.length) console.info('No admins yet.');
        for (const a of admins) {
          console.info(
            `${a.username.padEnd(24)} ${a.role.padEnd(8)} since ${a.createdAt.slice(0, 10)}`,
          );
        }
        break;
      }

      default:
        console.info(USAGE);
        process.exitCode = command ? 1 : 0;
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
