'use strict';
// Creativo Mock API: a small REST API with token-based authentication (JWT), backed by JSON files.
// It stands in for a real backend while the app is being built (Supabase is postponed).
//
//   Public     GET  /                       status + list of endpoints
//              POST /auth/register          create an account (saved to users.json)
//              POST /auth/login             email/username + password → access token (JWT)
//              POST /auth/biometric/login   biometric login token → access token
//              POST /auth/forgot-password   reset code (printed in the server terminal)
//              POST /auth/reset-password    code + new password
//              GET  /uploads/<file>         uploaded photos
//              GET  /demo/...               simulated 404 / 500 / empty / slow answers (Week 6 demo)
//   Protected  everything else. Needs "Authorization: Bearer <access_token>"; without a valid token
//              the answer is 401 and no data.
//
// handle() takes a plain request object and returns { status, body } (or a file to send), so the same
// code runs behind node:http (server/index.js) and directly inside the Jest tests.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { signJwt, verifyJwt } = require('./lib/jwt');
const { fingerprint, hashPassword, randomToken, verifyPassword } = require('./lib/password');
const { createStore } = require('./lib/store');

// Only for local development. A real server reads its secret from the environment.
const DEV_SECRET = 'creativo-dev-secret-ganti-sebelum-produksi';

const MIN_PASSWORD_LENGTH = 8;
const NAME_MAX = 80;
const HEADLINE_MAX = 120;
const MAX_FOCUS = 5;
const CAPTION_MAX = 2200;
const COMMENT_MAX = 1000;
const MESSAGE_MAX = 2000;
const MAX_POST_IMAGES = 10;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const EXPERIENCE_LEVELS = ['student', 'junior', 'mid', 'senior', 'lead'];
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };
const CONTENT_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic' };

const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_MS = 60_000;
const RESET_CODE_TTL_MS = 15 * 60_000;
const RESET_MAX_ATTEMPTS = 5;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with a new password, or null when it is fine (same rules as the app's form). */
function passwordProblem(password) {
  if (typeof password !== 'string' || !password) return 'Kata sandi wajib diisi.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Kata sandi harus berisi huruf dan angka.';
  return null;
}

const ok = (body, status = 200) => ({ status, body });
const fail = (status, message, code) => ({ status, body: { message, code } });
const isText = (value) => typeof value === 'string';

/** "Bearer eyJhbGciOi…x9fQ": enough to tell tokens apart in a log, never the whole token. */
const maskToken = (token) => (token.length > 24 ? `${token.slice(0, 10)}…${token.slice(-6)}` : '***');

function createApp({
  dataDir,
  seedDir = path.join(__dirname, 'seed'),
  uploadsDir = path.join(dataDir, 'uploads'),
  secret = process.env.JWT_SECRET || DEV_SECRET,
  tokenTtlSeconds = 60 * 60,
  now = () => Date.now(),
  log = console.log,
  reset = false,
}) {
  const store = createStore({ dataDir, seedDir, reset });
  const { users, db } = store;
  fs.mkdirSync(uploadsDir, { recursive: true });

  const iso = () => new Date(now()).toISOString();
  const nowSeconds = () => Math.floor(now() / 1000);
  const uuid = () => crypto.randomUUID();

  /** Failed logins per email/username: after 5 in a row the account waits a minute */
  const loginFailures = new Map();
  /** Password reset codes per email (only their fingerprint), valid 15 minutes */
  const resetCodes = new Map();

  /* ---------------------------------------------------------------- */
  /*  Views: what each kind of row looks like in a response           */
  /* ---------------------------------------------------------------- */

  /** Your own account. Never includes the password hash or login tokens. */
  const ownProfile = (u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    full_name: u.full_name,
    avatar_url: u.avatar_url,
    profession: u.profession,
    specializations: u.specializations,
    experience_level: u.experience_level,
    headline: u.headline,
    open_to_work: u.open_to_work,
    onboarded_at: u.onboarded_at,
    created_at: u.created_at,
  });

  /** Someone else's card: no email. */
  const publicProfile = (u) => ({
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    avatar_url: u.avatar_url,
    profession: u.profession,
    specializations: u.specializations,
    experience_level: u.experience_level,
    headline: u.headline,
    open_to_work: u.open_to_work,
  });

  const countBy = (rows, key) => {
    const counts = new Map();
    for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
    return counts;
  };

  function postViews(posts) {
    const likes = countBy(db.post_likes, 'post_id');
    const comments = countBy(db.comments, 'post_id');
    return posts.map((p) => ({ ...p, like_count: likes.get(p.id) ?? 0, comment_count: comments.get(p.id) ?? 0 }));
  }

  function commentView(c) {
    return { ...c, like_count: db.comment_likes.filter((l) => l.comment_id === c.id).length };
  }

  const findUser = (id) => users.find((u) => u.id === id);
  const findPost = (id) => db.posts.find((p) => p.id === id);
  const findComment = (id) => db.comments.find((c) => c.id === id);

  /* ---------------------------------------------------------------- */
  /*  Tokens                                                          */
  /* ---------------------------------------------------------------- */

  /** The login response: a fresh JWT access token plus the account. */
  function issueSession(user) {
    const iat = nowSeconds();
    const exp = iat + tokenTtlSeconds;
    const accessToken = signJwt(
      { sub: user.id, name: user.full_name, email: user.email, role: 'user', iat, exp, jti: uuid() },
      secret,
    );
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: tokenTtlSeconds,
      expires_at: new Date(exp * 1000).toISOString(),
      user: ownProfile(user),
    };
  }

  const TOKEN_ERRORS = {
    token_missing: 'Akses ditolak: token tidak ada. Silakan masuk terlebih dahulu.',
    token_invalid: 'Akses ditolak: token tidak valid.',
    token_expired: 'Sesi kamu telah berakhir. Silakan masuk kembali.',
    token_revoked: 'Sesi ini sudah keluar. Silakan masuk kembali.',
  };

  /** Reads "Authorization: Bearer <token>" and checks it: signature, expiry, logout, account. */
  function authenticate(header) {
    const match = isText(header) ? header.match(/^Bearer\s+(\S+)$/i) : null;
    if (!match) return { error: 'token_missing' };
    const token = match[1];
    const result = verifyJwt(token, secret, nowSeconds());
    if (result.error) return { error: result.error, token };

    const claims = result.payload;
    const user = findUser(claims.sub);
    if (!user) return { error: 'token_invalid', token };
    // Logged out, or issued before a password reset
    if (db.revoked_tokens.some((t) => t.jti === claims.jti) || claims.iat < (user.tokens_valid_after ?? 0)) {
      return { error: 'token_revoked', token };
    }
    return { user, claims, token };
  }

  /* ---------------------------------------------------------------- */
  /*  Notifications (what the old database triggers did)              */
  /* ---------------------------------------------------------------- */

  function notify(type, recipientId, actorId, { postId = null, commentId = null } = {}) {
    if (!recipientId || recipientId === actorId) return;
    db.notifications.unshift({
      id: uuid(),
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      post_id: postId,
      comment_id: commentId,
      created_at: iso(),
      read_at: null,
    });
  }

  /** Taking a like or follow back also takes its notification back. */
  function unnotify(match) {
    db.notifications = db.notifications.filter((n) => !match(n));
  }

  function notificationView(n) {
    const post = n.post_id ? findPost(n.post_id) : null;
    const comment = n.comment_id ? findComment(n.comment_id) : null;
    return { ...n, post: post ? { image_paths: post.image_paths } : null, comment: comment ? { body: comment.body } : null };
  }

  /* ---------------------------------------------------------------- */
  /*  Uploads                                                         */
  /* ---------------------------------------------------------------- */

  const UPLOAD_PATH = /^\/uploads\/([\w-]+\.(?:jpg|png|webp|heic))$/;

  function uploadFile(assetPath) {
    const match = isText(assetPath) ? assetPath.match(UPLOAD_PATH) : null;
    return match ? path.join(uploadsDir, match[1]) : null;
  }

  function removeUploads(paths) {
    for (const p of paths) {
      const file = uploadFile(p);
      if (file) fs.rm(file, { force: true }, () => {});
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Routes                                                          */
  /* ---------------------------------------------------------------- */

  const routes = [];
  function route(method, pattern, handler, { auth = true } = {}) {
    const keys = [];
    const source = pattern.replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    routes.push({ method, pattern, regex: new RegExp(`^${source}/?$`), keys, handler, auth });
  }

  route(
    'GET',
    '/',
    () =>
      ok({
        name: 'Creativo Mock API',
        status: 'ok',
        time: iso(),
        endpoints: routes.map((r) => `${r.method} ${r.pattern}${r.auth ? '  (butuh token)' : ''}`),
      }),
    { auth: false },
  );

  /* ---------- Auth ---------- */

  route(
    'POST',
    '/auth/register',
    ({ body }) => {
      const fullName = isText(body.full_name) ? body.full_name.trim() : '';
      const email = isText(body.email) ? body.email.trim().toLowerCase() : '';
      if (!fullName || !email || !body.password) {
        return fail(400, 'Nama lengkap, email, dan kata sandi wajib diisi.', 'validation_error');
      }
      if (fullName.length > NAME_MAX) return fail(400, `Nama maksimal ${NAME_MAX} karakter.`, 'validation_error');
      if (!EMAIL.test(email)) return fail(400, 'Masukkan alamat email yang valid.', 'validation_error');
      const weak = passwordProblem(body.password);
      if (weak) return fail(400, weak, 'validation_error');
      if (users.some((u) => u.email === email)) return fail(409, 'Email ini sudah terdaftar. Silakan masuk.', 'email_taken');

      // username from the email: "rina.kartika@..." → "rina.kartika", numbered if taken
      const base = email.split('@')[0].replace(/[^a-z0-9._]/g, '').slice(0, 24) || 'pengguna';
      let username = base;
      for (let n = 2; users.some((u) => u.username === username); n++) username = `${base}${n}`;

      const user = {
        id: uuid(),
        username,
        email,
        full_name: fullName,
        password_hash: hashPassword(body.password),
        avatar_url: null,
        profession: null,
        specializations: [],
        experience_level: null,
        headline: null,
        open_to_work: false,
        onboarded_at: null,
        created_at: iso(),
        tokens_valid_after: 0,
        biometric_tokens: [],
      };
      users.push(user);
      store.saveUsers();
      log(`[auth] Akun baru: ${email} (@${username}) → disimpan di ${path.relative(process.cwd(), store.files.users)}`);
      return ok({ message: 'Akun berhasil dibuat. Silakan masuk.', user: ownProfile(user) }, 201);
    },
    { auth: false },
  );

  route(
    'POST',
    '/auth/login',
    ({ body }) => {
      // "identifier" is an email or a username; plain { email, password } works too
      const raw = isText(body.identifier) ? body.identifier : isText(body.email) ? body.email : '';
      const identifier = raw.trim().toLowerCase();
      if (!identifier || !body.password) {
        return fail(400, 'Email/username dan kata sandi wajib diisi.', 'validation_error');
      }

      const failures = loginFailures.get(identifier);
      if (failures && failures.lockedUntil > now()) {
        const seconds = Math.ceil((failures.lockedUntil - now()) / 1000);
        return fail(429, `Terlalu banyak percobaan masuk. Coba lagi dalam ${seconds} detik.`, 'too_many_attempts');
      }

      const user = users.find((u) => u.email === identifier || u.username === identifier);
      // Checked even without an account, so a wrong email and a wrong password look exactly alike
      const valid = verifyPassword(String(body.password), user?.password_hash);
      if (!user || !valid) {
        // Counting continues until a lock; once a lock has passed it starts over
        const count = (failures && failures.lockedUntil === 0 ? failures.count : 0) + 1;
        loginFailures.set(identifier, { count, lockedUntil: count >= LOGIN_MAX_FAILURES ? now() + LOGIN_LOCK_MS : 0 });
        log(`[auth] Login gagal: ${identifier} (${count}x)`);
        return fail(401, 'Email/username atau kata sandi salah.', 'invalid_credentials');
      }

      loginFailures.delete(identifier);
      const session = issueSession(user);
      log(
        `[auth] Login berhasil: ${user.email} → access token dibuat (JWT HS256, berlaku ${tokenTtlSeconds / 60} menit): ${maskToken(session.access_token)}`,
      );
      return ok(session);
    },
    { auth: false },
  );

  route('GET', '/auth/me', ({ user }) => ok({ user: ownProfile(user) }));

  route('PATCH', '/auth/me', ({ user, body }) => {
    const next = {};
    if ('full_name' in body) {
      const name = isText(body.full_name) ? body.full_name.trim() : '';
      if (!name) return fail(400, 'Nama wajib diisi.', 'validation_error');
      if (name.length > NAME_MAX) return fail(400, `Nama maksimal ${NAME_MAX} karakter.`, 'validation_error');
      next.full_name = name;
    }
    if ('headline' in body) {
      const headline = isText(body.headline) ? body.headline.trim() : '';
      if (headline.length > HEADLINE_MAX) return fail(400, `Bio maksimal ${HEADLINE_MAX} karakter.`, 'validation_error');
      next.headline = headline || null;
    }
    if ('profession' in body) {
      if (body.profession !== null && !(isText(body.profession) && body.profession.length <= 40)) {
        return fail(400, 'Profesi tidak valid.', 'validation_error');
      }
      next.profession = body.profession;
    }
    if ('specializations' in body) {
      const list = body.specializations;
      if (!Array.isArray(list) || list.length > MAX_FOCUS || !list.every((s) => isText(s) && s.length <= 60)) {
        return fail(400, `Pilih maksimal ${MAX_FOCUS} fokus.`, 'validation_error');
      }
      next.specializations = list;
    }
    if ('experience_level' in body) {
      if (body.experience_level !== null && !EXPERIENCE_LEVELS.includes(body.experience_level)) {
        return fail(400, 'Tingkat pengalaman tidak valid.', 'validation_error');
      }
      next.experience_level = body.experience_level;
    }
    if ('open_to_work' in body) {
      if (typeof body.open_to_work !== 'boolean') return fail(400, 'Status peluang tidak valid.', 'validation_error');
      next.open_to_work = body.open_to_work;
    }
    if ('avatar_url' in body) {
      const url = body.avatar_url;
      // Your own upload, or a web address (the demo accounts' illustrated avatars)
      const allowed = url === null || (uploadFile(url) && path.basename(uploadFile(url)).startsWith(user.id)) || /^https:\/\//.test(url);
      if (!allowed) return fail(400, 'Foto profil tidak valid.', 'validation_error');
      next.avatar_url = url;
    }
    // The time is set by the server; null sends the user back to onboarding
    if ('onboarded_at' in body) next.onboarded_at = body.onboarded_at ? iso() : null;

    Object.assign(user, next);
    store.saveUsers();
    return ok({ user: ownProfile(user) });
  });

  route('POST', '/auth/logout', ({ claims, user }) => {
    // A JWT stays valid until it expires, so the server remembers its id (jti) as logged out
    const nowSec = nowSeconds();
    db.revoked_tokens = db.revoked_tokens.filter((t) => t.exp > nowSec);
    db.revoked_tokens.push({ jti: claims.jti, exp: claims.exp });
    store.saveDb();
    log(`[auth] Logout: ${user.email} → token dicabut, tidak bisa dipakai lagi`);
    return ok({ message: 'Logout berhasil. Token ini tidak berlaku lagi.' });
  });

  /* ---------- Biometric login ---------- */

  // Turning it on: the app (already logged in) gets a long random token that it keeps in SecureStore.
  // After a fingerprint / face scan the app sends that token instead of the password.
  route('POST', '/auth/biometric', ({ user }) => {
    const token = randomToken();
    user.biometric_tokens = [...(user.biometric_tokens ?? []), { hash: fingerprint(token), created_at: iso() }].slice(-5);
    store.saveUsers();
    log(`[auth] Login biometrik diaktifkan untuk ${user.email}`);
    return ok({ biometric_token: token }, 201);
  });

  route('DELETE', '/auth/biometric', ({ user, body }) => {
    const hash = isText(body.biometric_token) ? fingerprint(body.biometric_token) : null;
    user.biometric_tokens = hash ? (user.biometric_tokens ?? []).filter((t) => t.hash !== hash) : [];
    store.saveUsers();
    return ok({ message: 'Login biometrik dinonaktifkan.' });
  });

  route(
    'POST',
    '/auth/biometric/login',
    ({ body }) => {
      const hash = isText(body.biometric_token) ? fingerprint(body.biometric_token) : null;
      const user = hash ? users.find((u) => (u.biometric_tokens ?? []).some((t) => t.hash === hash)) : null;
      if (!user) {
        return fail(401, 'Login biometrik tidak berlaku lagi. Masuk dengan email dan kata sandi.', 'biometric_invalid');
      }
      const session = issueSession(user);
      log(`[auth] Login biometrik berhasil: ${user.email} → access token dibuat: ${maskToken(session.access_token)}`);
      return ok(session);
    },
    { auth: false },
  );

  /* ---------- Forgot password ---------- */

  route(
    'POST',
    '/auth/forgot-password',
    ({ body }) => {
      const email = isText(body.email) ? body.email.trim().toLowerCase() : '';
      if (!EMAIL.test(email)) return fail(400, 'Masukkan alamat email yang valid.', 'validation_error');
      if (users.some((u) => u.email === email)) {
        const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
        resetCodes.set(email, { hash: fingerprint(code), expiresAt: now() + RESET_CODE_TTL_MS, attempts: 0 });
        // Stands in for the email a real server would send
        log(`[mail] Kode reset kata sandi untuk ${email}: ${code} (berlaku 15 menit)`);
      }
      // The same answer either way: nobody can find out which emails have an account
      return ok({ message: 'Jika email terdaftar, kode reset sudah dikirim.' });
    },
    { auth: false },
  );

  route(
    'POST',
    '/auth/reset-password',
    ({ body }) => {
      const email = isText(body.email) ? body.email.trim().toLowerCase() : '';
      const code = isText(body.code) ? body.code.trim() : '';
      if (!email || !code) return fail(400, 'Email dan kode reset wajib diisi.', 'validation_error');
      const weak = passwordProblem(body.password);
      if (weak) return fail(400, weak, 'validation_error');

      const entry = resetCodes.get(email);
      const user = users.find((u) => u.email === email);
      if (!entry || !user || entry.expiresAt < now() || entry.attempts >= RESET_MAX_ATTEMPTS) {
        resetCodes.delete(email);
        return fail(400, 'Kode reset salah atau sudah kedaluwarsa. Minta kode baru.', 'reset_code_invalid');
      }
      if (entry.hash !== fingerprint(code)) {
        entry.attempts += 1;
        return fail(400, 'Kode reset salah atau sudah kedaluwarsa. Minta kode baru.', 'reset_code_invalid');
      }

      resetCodes.delete(email);
      user.password_hash = hashPassword(body.password);
      // Every token and biometric login from before the reset stops working
      user.tokens_valid_after = nowSeconds();
      user.biometric_tokens = [];
      store.saveUsers();
      log(`[auth] Kata sandi diatur ulang: ${email} → semua sesi lama dicabut`);
      return ok({ message: 'Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.' });
    },
    { auth: false },
  );

  /* ---------- Profiles ---------- */

  route('GET', '/profiles', () => {
    const list = users
      .filter((u) => u.onboarded_at)
      .sort((a, b) => b.onboarded_at.localeCompare(a.onboarded_at))
      .map(publicProfile);
    return ok({ profiles: list });
  });

  route('GET', '/profiles/:id', ({ params }) => {
    const user = findUser(params.id);
    return user ? ok({ profile: publicProfile(user) }) : fail(404, 'Pengguna tidak ditemukan.', 'not_found');
  });

  /* ---------- Uploads ---------- */

  route('POST', '/uploads', ({ user, body }) => {
    const ext = IMAGE_TYPES[body.mime_type];
    if (!ext) return fail(400, 'Format foto harus JPG, PNG, WEBP, atau HEIC.', 'validation_error');
    const base64 = isText(body.base64) ? body.base64.replace(/^data:[^;]+;base64,/, '') : '';
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length === 0) return fail(400, 'Foto kosong.', 'validation_error');
    if (bytes.length > MAX_UPLOAD_BYTES) return fail(413, 'Ukuran foto maksimal 10 MB.', 'too_large');

    const file = `${user.id}-${uuid()}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, file), bytes);
    return ok({ path: `/uploads/${file}` }, 201);
  });

  route(
    'GET',
    '/uploads/:file',
    ({ params }) => {
      const file = uploadFile(`/uploads/${params.file}`);
      if (!file || !fs.existsSync(file)) return fail(404, 'Foto tidak ditemukan.', 'not_found');
      return { status: 200, file, contentType: CONTENT_TYPES[path.extname(file).slice(1)] ?? 'application/octet-stream' };
    },
    { auth: false },
  );

  /* ---------- Posts ---------- */

  route('GET', '/posts', () => {
    const latest = [...db.posts].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
    return ok({ posts: postViews(latest) });
  });

  route('GET', '/posts/liked', ({ user }) =>
    ok({ post_ids: db.post_likes.filter((l) => l.user_id === user.id).map((l) => l.post_id) }),
  );

  route('POST', '/posts', ({ user, body }) => {
    const paths = Array.isArray(body.image_paths) ? body.image_paths : [];
    if (paths.length === 0 || paths.length > MAX_POST_IMAGES) {
      return fail(400, `Pilih 1 sampai ${MAX_POST_IMAGES} foto.`, 'validation_error');
    }
    // Only photos this user uploaded themselves
    const own = paths.every((p) => {
      const file = uploadFile(p);
      return file && path.basename(file).startsWith(user.id) && fs.existsSync(file);
    });
    if (!own) return fail(400, 'Foto belum terunggah. Coba lagi.', 'validation_error');
    const caption = isText(body.caption) ? body.caption.trim() : '';
    if (caption.length > CAPTION_MAX) return fail(400, `Caption maksimal ${CAPTION_MAX} karakter.`, 'validation_error');
    const kind = body.kind === 'post' ? 'post' : 'karya';

    const at = iso();
    const post = { id: uuid(), author_id: user.id, image_paths: paths, caption, kind, created_at: at, updated_at: at };
    db.posts.push(post);
    store.saveDb();
    return ok({ post: postViews([post])[0] }, 201);
  });

  /** The post, if it exists and belongs to the user; otherwise the error response. */
  function ownPost(user, id) {
    const post = findPost(id);
    if (!post) return { error: fail(404, 'Postingan tidak ditemukan.', 'not_found') };
    if (post.author_id !== user.id) return { error: fail(403, 'Kamu hanya bisa mengubah postinganmu sendiri.', 'forbidden') };
    return { post };
  }

  route('PATCH', '/posts/:id', ({ user, params, body }) => {
    const { post, error } = ownPost(user, params.id);
    if (error) return error;
    const caption = isText(body.caption) ? body.caption.trim() : '';
    if (caption.length > CAPTION_MAX) return fail(400, `Caption maksimal ${CAPTION_MAX} karakter.`, 'validation_error');
    post.caption = caption;
    post.updated_at = iso();
    store.saveDb();
    return ok({ post: postViews([post])[0] });
  });

  route('DELETE', '/posts/:id', ({ user, params }) => {
    const { post, error } = ownPost(user, params.id);
    if (error) return error;
    const commentIds = new Set(db.comments.filter((c) => c.post_id === post.id).map((c) => c.id));
    db.posts = db.posts.filter((p) => p.id !== post.id);
    db.post_likes = db.post_likes.filter((l) => l.post_id !== post.id);
    db.comments = db.comments.filter((c) => c.post_id !== post.id);
    db.comment_likes = db.comment_likes.filter((l) => !commentIds.has(l.comment_id));
    unnotify((n) => n.post_id === post.id);
    store.saveDb();
    removeUploads(post.image_paths);
    return ok({ message: 'Postingan dihapus.' });
  });

  route('POST', '/posts/:id/like', ({ user, params }) => {
    const post = findPost(params.id);
    if (!post) return fail(404, 'Postingan tidak ditemukan.', 'not_found');
    if (!db.post_likes.some((l) => l.post_id === post.id && l.user_id === user.id)) {
      db.post_likes.push({ post_id: post.id, user_id: user.id, created_at: iso() });
      notify('like_post', post.author_id, user.id, { postId: post.id });
      store.saveDb();
    }
    return ok({ liked: true });
  });

  route('DELETE', '/posts/:id/like', ({ user, params }) => {
    db.post_likes = db.post_likes.filter((l) => !(l.post_id === params.id && l.user_id === user.id));
    unnotify((n) => n.type === 'like_post' && n.post_id === params.id && n.actor_id === user.id);
    store.saveDb();
    return ok({ liked: false });
  });

  /* ---------- Comments ---------- */

  route('GET', '/posts/:id/comments', ({ user, params }) => {
    const comments = db.comments
      .filter((c) => c.post_id === params.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(commentView);
    const ids = new Set(comments.map((c) => c.id));
    const likedIds = db.comment_likes.filter((l) => l.user_id === user.id && ids.has(l.comment_id)).map((l) => l.comment_id);
    return ok({ comments, liked_ids: likedIds });
  });

  route('POST', '/posts/:id/comments', ({ user, params, body }) => {
    const post = findPost(params.id);
    if (!post) return fail(404, 'Postingan tidak ditemukan.', 'not_found');
    const text = isText(body.body) ? body.body.trim() : '';
    if (!text) return fail(400, 'Komentar tidak boleh kosong.', 'validation_error');
    if (text.length > COMMENT_MAX) return fail(400, `Komentar maksimal ${COMMENT_MAX} karakter.`, 'validation_error');

    let parent = null;
    if (body.parent_id) {
      parent = findComment(body.parent_id);
      // Replies are one level deep, like Instagram
      if (!parent || parent.post_id !== post.id || parent.parent_id) return fail(400, 'Komentar yang dibalas tidak ditemukan.', 'validation_error');
    }

    const comment = { id: uuid(), post_id: post.id, author_id: user.id, parent_id: parent?.id ?? null, body: text, created_at: iso() };
    db.comments.push(comment);
    if (parent) notify('reply', parent.author_id, user.id, { postId: post.id, commentId: comment.id });
    if (!parent || parent.author_id !== post.author_id) notify('comment', post.author_id, user.id, { postId: post.id, commentId: comment.id });
    store.saveDb();
    return ok({ comment: commentView(comment) }, 201);
  });

  route('DELETE', '/comments/:id', ({ user, params }) => {
    const comment = findComment(params.id);
    if (!comment) return fail(404, 'Komentar tidak ditemukan.', 'not_found');
    const post = findPost(comment.post_id);
    // The writer can delete it, and so can the owner of the post
    if (comment.author_id !== user.id && post?.author_id !== user.id) {
      return fail(403, 'Kamu tidak bisa menghapus komentar ini.', 'forbidden');
    }
    const gone = new Set(db.comments.filter((c) => c.id === comment.id || c.parent_id === comment.id).map((c) => c.id));
    db.comments = db.comments.filter((c) => !gone.has(c.id));
    db.comment_likes = db.comment_likes.filter((l) => !gone.has(l.comment_id));
    unnotify((n) => gone.has(n.comment_id));
    store.saveDb();
    return ok({ deleted: gone.size });
  });

  route('POST', '/comments/:id/like', ({ user, params }) => {
    const comment = findComment(params.id);
    if (!comment) return fail(404, 'Komentar tidak ditemukan.', 'not_found');
    if (!db.comment_likes.some((l) => l.comment_id === comment.id && l.user_id === user.id)) {
      db.comment_likes.push({ comment_id: comment.id, user_id: user.id, created_at: iso() });
      notify('like_comment', comment.author_id, user.id, { postId: comment.post_id, commentId: comment.id });
      store.saveDb();
    }
    return ok({ liked: true });
  });

  route('DELETE', '/comments/:id/like', ({ user, params }) => {
    db.comment_likes = db.comment_likes.filter((l) => !(l.comment_id === params.id && l.user_id === user.id));
    unnotify((n) => n.type === 'like_comment' && n.comment_id === params.id && n.actor_id === user.id);
    store.saveDb();
    return ok({ liked: false });
  });

  /* ---------- Follows ---------- */

  route('GET', '/users/:id/connections', ({ params }) => {
    const newestFirst = (a, b) => b.created_at.localeCompare(a.created_at);
    return ok({
      followers: db.follows.filter((f) => f.following_id === params.id).sort(newestFirst).map((f) => f.follower_id),
      following: db.follows.filter((f) => f.follower_id === params.id).sort(newestFirst).map((f) => f.following_id),
    });
  });

  route('POST', '/users/:id/follow', ({ user, params }) => {
    if (params.id === user.id) return fail(400, 'Kamu tidak bisa mengikuti diri sendiri.', 'validation_error');
    if (!findUser(params.id)) return fail(404, 'Pengguna tidak ditemukan.', 'not_found');
    if (!db.follows.some((f) => f.follower_id === user.id && f.following_id === params.id)) {
      db.follows.push({ follower_id: user.id, following_id: params.id, created_at: iso() });
      notify('follow', params.id, user.id);
      store.saveDb();
    }
    return ok({ following: true });
  });

  route('DELETE', '/users/:id/follow', ({ user, params }) => {
    db.follows = db.follows.filter((f) => !(f.follower_id === user.id && f.following_id === params.id));
    unnotify((n) => n.type === 'follow' && n.recipient_id === params.id && n.actor_id === user.id);
    store.saveDb();
    return ok({ following: false });
  });

  /* ---------- Notifications ---------- */

  const myNotifications = (user) => db.notifications.filter((n) => n.recipient_id === user.id);

  route('GET', '/notifications', ({ user }) =>
    ok({
      notifications: myNotifications(user)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 60)
        .map(notificationView),
    }),
  );

  // Polled by the app every few seconds: tiny answer, so it can tell when to reload the list
  route('GET', '/notifications/status', ({ user }) => {
    const mine = myNotifications(user);
    return ok({ unread: mine.filter((n) => !n.read_at).length, latest_id: mine[0]?.id ?? null, total: mine.length });
  });

  route('POST', '/notifications/read-all', ({ user }) => {
    const at = iso();
    for (const n of myNotifications(user)) if (!n.read_at) n.read_at = at;
    store.saveDb();
    return ok({ message: 'Semua notifikasi ditandai dibaca.' });
  });

  /* ---------- Direct messages ---------- */

  const between = (me, other) => (m) =>
    (m.sender_id === me && m.recipient_id === other) || (m.sender_id === other && m.recipient_id === me);

  route('GET', '/conversations', ({ user }) => {
    const byOther = new Map();
    for (const m of db.messages) {
      if (m.sender_id !== user.id && m.recipient_id !== user.id) continue;
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const c = byOther.get(other) ?? { other_id: other, last_body: '', last_at: '', last_sender_id: '', unread: 0 };
      if (m.created_at >= c.last_at) Object.assign(c, { last_body: m.body, last_at: m.created_at, last_sender_id: m.sender_id });
      if (m.recipient_id === user.id && !m.read_at) c.unread += 1;
      byOther.set(other, c);
    }
    const conversations = [...byOther.values()].sort((a, b) => b.last_at.localeCompare(a.last_at));
    return ok({ conversations });
  });

  route('GET', '/messages/:otherId', ({ user, params }) => {
    const thread = db.messages.filter(between(user.id, params.otherId)).sort((a, b) => a.seq - b.seq);
    return ok({ messages: thread.slice(-200) });
  });

  route('POST', '/messages/:otherId', ({ user, params, body }) => {
    if (params.otherId === user.id) return fail(400, 'Kamu tidak bisa mengirim pesan ke diri sendiri.', 'validation_error');
    if (!findUser(params.otherId)) return fail(404, 'Pengguna tidak ditemukan.', 'not_found');
    const text = isText(body.body) ? body.body.trim() : '';
    if (!text) return fail(400, 'Pesan tidak boleh kosong.', 'validation_error');
    if (text.length > MESSAGE_MAX) return fail(400, `Pesan maksimal ${MESSAGE_MAX} karakter.`, 'validation_error');

    const message = {
      id: uuid(),
      seq: store.nextSeq(),
      sender_id: user.id,
      recipient_id: params.otherId,
      body: text,
      created_at: iso(),
      read_at: null,
    };
    db.messages.push(message);
    store.saveDb();
    return ok({ message }, 201);
  });

  route('POST', '/messages/:otherId/read', ({ user, params }) => {
    const at = iso();
    for (const m of db.messages) if (m.recipient_id === user.id && m.sender_id === params.otherId && !m.read_at) m.read_at = at;
    store.saveDb();
    return ok({ message: 'Pesan ditandai dibaca.' });
  });

  // Polled by the app: messages sent to you after `since` (a sequence number this endpoint handed out)
  route('GET', '/inbox/updates', ({ user, query }) => {
    const cursor = db.meta.seq;
    const since = Number(query.get('since'));
    if (!query.has('since') || !Number.isFinite(since)) return ok({ messages: [], cursor });
    const messages = db.messages.filter((m) => m.recipient_id === user.id && m.seq > since).sort((a, b) => a.seq - b.seq);
    return ok({ messages, cursor });
  });

  /* ---------- Demo: every way a request can end (Week 6) ---------- */

  const DEMO_STATUS = {
    200: 'Request berhasil.',
    400: 'Request tidak valid.',
    401: 'Token tidak valid.',
    403: 'Kamu tidak memiliki izin akses.',
    404: 'Data tidak ditemukan.',
    500: 'Terjadi kesalahan pada server.',
    503: 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.',
  };
  const demoData = () => db.posts.slice(0, 3).map((p) => ({ id: p.id, caption: p.caption }));

  // Answers with the status code in the address: GET /demo/status/404 → 404 Not Found
  route(
    'GET',
    '/demo/status/:code',
    ({ params }) => {
      const code = Number(params.code);
      if (!DEMO_STATUS[code]) return fail(400, `Status ${params.code} tidak tersedia untuk demo.`, 'validation_error');
      if (code === 200) return ok({ success: true, data: demoData() });
      return { status: code, body: { success: false, message: DEMO_STATUS[code], code: `demo_${code}` } };
    },
    { auth: false },
  );

  // 200 with an empty list: the app should show its empty state, not an error
  route('GET', '/demo/empty', () => ok({ success: true, data: [] }), { auth: false });

  // Waits before answering, to trigger the app's timeout: GET /demo/slow?ms=8000
  route(
    'GET',
    '/demo/slow',
    async ({ query }) => {
      const ms = Math.min(Math.max(Number(query.get('ms')) || 8000, 0), 30_000);
      await new Promise((resolve) => setTimeout(resolve, ms));
      return ok({ success: true, data: demoData(), waited_ms: ms });
    },
    { auth: false },
  );

  /* ---------------------------------------------------------------- */
  /*  Request handling                                                */
  /* ---------------------------------------------------------------- */

  function describeAuth(auth) {
    if (!auth) return '';
    if (auth.error === 'token_missing') return ' · ditolak: tanpa token';
    if (auth.error) return ` · ditolak: ${auth.error} (Bearer ${maskToken(auth.token)})`;
    return ` · Bearer ${maskToken(auth.token)} ✓ ${auth.user.email}`;
  }

  /**
   * req: { method, path, query?: URLSearchParams, headers?: { authorization?, 'x-creativo-poll'? }, body? }
   * Returns { status, body } or, for a photo, { status, file, contentType }.
   */
  async function handle(req) {
    const started = now();
    const method = String(req.method || 'GET').toUpperCase();
    const pathname = req.path || '/';
    const headers = req.headers || {};
    if (method === 'OPTIONS') return { status: 204, body: null };

    let params = null;
    const matched = routes.find((r) => {
      if (r.method !== method) return false;
      const m = pathname.match(r.regex);
      if (!m) return false;
      params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return true;
    });

    let result;
    let auth = null;
    if (!matched) {
      result = fail(404, 'Endpoint tidak ditemukan.', 'not_found');
    } else {
      if (matched.auth) auth = authenticate(headers.authorization);
      if (auth?.error) {
        result = fail(401, TOKEN_ERRORS[auth.error], auth.error);
      } else {
        const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
        const query = req.query instanceof URLSearchParams ? req.query : new URLSearchParams(req.query ?? '');
        try {
          result = await matched.handler({ params, body, query, user: auth?.user, claims: auth?.claims });
        } catch (err) {
          log(`[api] ${method} ${pathname} → 500 ${err?.stack ?? err}`);
          result = fail(500, 'Terjadi kesalahan di server. Silakan coba lagi.', 'server_error');
        }
      }
    }

    // Requests the app repeats every few seconds (polling) are only logged when they fail
    if (!headers['x-creativo-poll'] || result.status >= 400) {
      log(`[api] ${method} ${pathname} → ${result.status} (${now() - started} ms)${describeAuth(auth)}`);
    }
    return result;
  }

  return { handle, store, passwordProblem };
}

module.exports = { createApp, passwordProblem, MIN_PASSWORD_LENGTH };
