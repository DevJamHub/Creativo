'use strict';
// JSON Web Token (JWT, HS256): the access token the Creativo API hands out at login.
// A JWT is three base64url parts, "header.payload.signature". The signature is an HMAC-SHA256 of
// "header.payload" made with the server's secret key, so only this server can create a valid token,
// and changing anything in the payload (another user id, a later expiry) breaks the signature.

const crypto = require('node:crypto');

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
const hmac = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest();

/** Signs `payload` (the claims: sub, name, role, iat, exp, jti) into a JWT string. */
function signJwt(payload, secret) {
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${body}.${hmac(body, secret).toString('base64url')}`;
}

/**
 * Checks a token: the signature must match and it must not be expired.
 * Returns { payload } for a valid token, otherwise { error: 'token_invalid' | 'token_expired' }.
 */
function verifyJwt(token, secret, nowSeconds) {
  const parts = typeof token === 'string' ? token.split('.') : [];
  if (parts.length !== 3 || parts.some((p) => !p)) return { error: 'token_invalid' };
  const [header, payload, signature] = parts;

  const expected = hmac(`${header}.${payload}`, secret);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return { error: 'token_invalid' };

  let claims;
  try {
    // Only HS256 is accepted: a token claiming "alg": "none" never gets past this
    if (decode(header).alg !== 'HS256') return { error: 'token_invalid' };
    claims = decode(payload);
  } catch {
    return { error: 'token_invalid' };
  }
  if (typeof claims.exp !== 'number' || claims.exp <= nowSeconds) return { error: 'token_expired' };
  return { payload: claims };
}

module.exports = { signJwt, verifyJwt };
