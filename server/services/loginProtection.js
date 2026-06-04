/**
 * Brute-force protection for login — in-memory lockout after repeated failures.
 * Resets on successful login. For multi-instance production, use Redis.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

/** @type {Map<string, { attempts: number, windowStart: number, lockedUntil: number }>} */
const store = new Map();

function keyFor(ip, email) {
  return `${ip || 'unknown'}:${String(email || '')
    .trim()
    .toLowerCase()}`;
}

export function isLoginLocked(ip, email) {
  const entry = store.get(keyFor(ip, email));
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil > 0) {
    store.delete(keyFor(ip, email));
  }
  return false;
}

export function getLockoutRemainingMs(ip, email) {
  const entry = store.get(keyFor(ip, email));
  if (!entry?.lockedUntil) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}

export function recordFailedLogin(ip, email) {
  const key = keyFor(ip, email);
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { attempts: 0, windowStart: now, lockedUntil: 0 };
  }

  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.attempts = 0;
    entry.windowStart = now;
  }

  store.set(key, entry);
}

export function clearFailedLogins(ip, email) {
  store.delete(keyFor(ip, email));
}

/** @param {import('express').Request} req */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function normalizeLoginEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(email, password) {
  const normalized = normalizeLoginEmail(email);
  if (!normalized || !password) {
    return { ok: false, message: 'Email and password are required' };
  }
  if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
    return { ok: false, message: 'Invalid email or password' };
  }
  if (String(password).length > 128) {
    return { ok: false, message: 'Invalid email or password' };
  }
  return { ok: true, email: normalized };
}
