'use strict';
// Lets the Jest tests talk to the real mock API without a network or a port: a fetch() that hands each
// request straight to app.handle() and wraps the answer like a Response. It also records every request
// (method, path, Authorization header) so a test can check what the app actually sent.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createApp } = require('./app');

/** A fresh API on a throwaway copy of the seed (the 10 demo accounts), with a clock the test can move. */
function createTestServer({ tokenTtlSeconds = 3600 } = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'creativo-test-'));
  const clock = { now: Date.now() };
  // What the server would print in its terminal (e.g. the password reset code)
  const logs = [];
  const app = createApp({ dataDir, now: () => clock.now, log: (line) => logs.push(line), tokenTtlSeconds });
  const requests = [];

  async function fetch(url, init = {}) {
    const { pathname, searchParams } = new URL(url);
    const headers = {};
    for (const [key, value] of Object.entries(init.headers ?? {})) headers[key.toLowerCase()] = value;
    requests.push({ method: init.method ?? 'GET', path: pathname, authorization: headers.authorization ?? null });

    const answer = app.handle({
      method: init.method ?? 'GET',
      path: pathname,
      query: searchParams,
      headers,
      body: init.body ? JSON.parse(init.body) : null,
    });
    // An aborted request (timeout, or replaced by a newer one) rejects like a real fetch
    const aborted = new Promise((_resolve, reject) => {
      if (init.signal?.aborted) reject(new Error('Aborted'));
      init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
    });
    aborted.catch(() => {}); // an abort after the answer arrived is not an error
    const result = await Promise.race([answer, aborted]);
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      json: async () => result.body,
    };
  }

  return {
    app,
    fetch,
    requests,
    logs,
    clock,
    dataDir,
    /** users.json exactly as it is on disk */
    readUsersFile: () => fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'),
    cleanup: () => fs.rmSync(dataDir, { recursive: true, force: true }),
  };
}

module.exports = { createTestServer };
