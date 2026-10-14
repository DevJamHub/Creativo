// JSON Web Token (JWT) helpers: a JWT is "header.payload.signature", each part base64url-encoded.
// Supabase hands out a JWT as the access token on login. These helpers only READ a token (to show
// who it belongs to and when it expires); checking the signature needs the server's secret key,
// so that is always done by Supabase, never by the app.

export interface JwtHeader {
  /** Signing algorithm, e.g. HS256 or ES256 */
  alg?: string;
  typ?: string;
}

export interface JwtClaims {
  /** Subject: the user's id */
  sub?: string;
  /** Postgres role the request runs as: 'authenticated' for a signed-in user */
  role?: string;
  email?: string;
  /** Issued at / expires at, in seconds since 1970 */
  iat?: number;
  exp?: number;
  session_id?: string;
}

export interface Jwt {
  header: JwtHeader;
  payload: JwtClaims;
  signature: string;
}

function base64UrlDecode(part: string): string {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  const binary = atob(base64);
  // atob gives one character per byte; turn the bytes back into UTF-8 text (names may have accents)
  return decodeURIComponent(Array.from(binary, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
}

function decodeObject<T>(part: string): T | null {
  const value: unknown = JSON.parse(base64UrlDecode(part));
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as T) : null;
}

/** The decoded header and claims, or null when the text isn't a JWT. Does NOT verify the signature. */
export function decodeJwt(token: string): Jwt | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !p)) return null;
  try {
    const header = decodeObject<JwtHeader>(parts[0]);
    const payload = decodeObject<JwtClaims>(parts[1]);
    return header && payload ? { header, payload, signature: parts[2] } : null;
  } catch {
    return null;
  }
}

/** Seconds until the token expires (negative once expired), or null if it has no exp claim. */
export function secondsLeft(claims: JwtClaims, now = Date.now()): number | null {
  return typeof claims.exp === 'number' ? Math.floor(claims.exp - now / 1000) : null;
}

/** First characters only, so a token can be shown in logs without giving it away. */
export function maskToken(token: string): string {
  return token.length <= 12 ? '***' : `${token.slice(0, 10)}…`;
}

/** The token from an "Authorization: Bearer <token>" header, or null. */
export function bearerToken(authorization: string | null | undefined): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}
