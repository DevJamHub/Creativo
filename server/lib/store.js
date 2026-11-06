'use strict';
// The mock API's "database": two JSON files in the data folder.
//   users.json  accounts. Every sign-up is added here; passwords only as scrypt hashes.
//   db.json     everything else: posts, likes, comments, follows, notifications, messages,
//               and the ids of tokens that were logged out.
// When the files don't exist yet (first start, or after a reset) they are copied from the seed folder,
// which holds the 10 demo accounts and their content.

const fs = require('node:fs');
const path = require('node:path');

const EMPTY_DB = {
  meta: { seq: 0 },
  posts: [],
  post_likes: [],
  comments: [],
  comment_likes: [],
  follows: [],
  notifications: [],
  messages: [],
  revoked_tokens: [],
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw new Error(`${file} bukan JSON yang valid: ${err.message}`);
  }
}

// Write to a temporary file, then swap it in: a crash mid-write never leaves half a file
function writeJson(file, value) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function createStore({ dataDir, seedDir, reset = false }) {
  const usersFile = path.join(dataDir, 'users.json');
  const dbFile = path.join(dataDir, 'db.json');
  fs.mkdirSync(dataDir, { recursive: true });

  for (const [file, name] of [
    [usersFile, 'users.json'],
    [dbFile, 'db.json'],
  ]) {
    if (reset || !fs.existsSync(file)) {
      const seed = seedDir ? path.join(seedDir, name) : null;
      if (seed && fs.existsSync(seed)) fs.copyFileSync(seed, file);
      else writeJson(file, name === 'users.json' ? [] : EMPTY_DB);
    }
  }

  const users = readJson(usersFile, []);
  const db = { ...structuredClone(EMPTY_DB), ...readJson(dbFile, EMPTY_DB) };

  return {
    users,
    db,
    files: { users: usersFile, db: dbFile },
    saveUsers: () => writeJson(usersFile, users),
    saveDb: () => writeJson(dbFile, db),
    /** Next number in an ever-growing sequence (orders messages for polling) */
    nextSeq() {
      db.meta.seq += 1;
      return db.meta.seq;
    },
  };
}

module.exports = { createStore };
