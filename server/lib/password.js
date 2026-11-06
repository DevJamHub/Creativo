'use strict';
// Credentials are never stored as text.
//   Passwords: scrypt (a deliberately slow hash) with a random salt per account, saved as
//   "scrypt$<salt>$<hash>". A login hashes the attempt the same way and compares the two.
//   Tokens and codes (biometric login token, reset code): a SHA-256 fingerprint, since they are
//   long random values already; the server can recognise them but can't give them back.

const crypto = require('node:crypto');

const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex')}`;
}

// Compared against when the account doesn't exist, so a wrong email takes as long as a wrong password
const DECOY = hashPassword(crypto.randomBytes(12).toString('hex'));

function verifyPassword(password, stored) {
  const [algorithm, salt, hash] = String(stored ?? DECOY).split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(String(password), salt, expected.length);
  return crypto.timingSafeEqual(actual, expected) && stored !== undefined && stored !== null;
}

const fingerprint = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

/** A long random token (biometric login), safe to put in a URL or header. */
const randomToken = () => crypto.randomBytes(32).toString('base64url');

module.exports = { hashPassword, verifyPassword, fingerprint, randomToken };
