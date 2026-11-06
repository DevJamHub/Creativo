'use strict';
// Starts the Creativo Mock API on this computer.
//   npm run server          start (data is kept in server/data/)
//   npm run server:reset    start from the seed again: the 10 demo accounts, sign-ups removed
// The phone (Expo Go) reaches it over Wi-Fi at http://<this computer's IP>:4000, printed on start.

const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 4000;
// Photos arrive as base64 inside JSON, a third larger than the file
const MAX_BODY_BYTES = 25 * 1024 * 1024;

const app = createApp({ dataDir: path.join(__dirname, 'data'), reset: process.argv.includes('--reset') });

const CORS = {
  // The web version of the app runs on another port, so the browser needs permission to call this API
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Creativo-Poll',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

function send(res, status, body) {
  if (body === null || body === undefined) {
    res.writeHead(status, CORS);
    res.end();
    return;
  }
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const chunks = [];
  let size = 0;
  let tooLarge = false;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      tooLarge = true;
      send(res, 413, { message: 'Data yang dikirim terlalu besar.', code: 'too_large' });
      req.destroy();
    } else {
      chunks.push(chunk);
    }
  });

  req.on('end', async () => {
    if (tooLarge) return;
    let body = null;
    if (size > 0) {
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        send(res, 400, { message: 'Body request harus berupa JSON.', code: 'invalid_json' });
        return;
      }
    }

    const result = await app.handle({ method: req.method, path: url.pathname, query: url.searchParams, headers: req.headers, body });
    if (result.file) {
      res.writeHead(200, { ...CORS, 'Content-Type': result.contentType, 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(result.file).pipe(res);
      return;
    }
    send(res, result.status, result.body);
  });
});

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sudah dipakai. Server Creativo mungkin sudah berjalan di terminal lain.`);
    console.error(`Pakai port lain: PORT=4001 npm run server (lalu isi EXPO_PUBLIC_API_URL di .env).`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  const rel = (file) => path.relative(process.cwd(), file);
  const demo = app.store.users[0];
  console.log('');
  console.log('  Creativo Mock API berjalan');
  console.log(`  Lokal     http://localhost:${PORT}`);
  for (const ip of lanAddresses()) console.log(`  Wi-Fi     http://${ip}:${PORT}   ← dipakai HP lewat Expo Go`);
  console.log(`  Akun      ${rel(app.store.files.users)} (${app.store.users.length} akun)`);
  console.log(`  Konten    ${rel(app.store.files.db)}`);
  if (demo) console.log(`  Coba      ${demo.email} / Creativo123 (akun demo lain ada di README)`);
  if (!process.env.JWT_SECRET) console.log('  Catatan   JWT_SECRET belum diatur, memakai kunci bawaan untuk development.');
  console.log('');
});
