/**
 * Brute-force protection for login — persisted in MySQL (works across app restarts).
 */

import { queryOne, execute } from "../db/query.js";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const WINDOW_SECONDS = Math.floor(WINDOW_MS / 1000);
const LOCKOUT_SECONDS = Math.floor(LOCKOUT_MS / 1000);

function normalizeIp(ip) {
  return String(ip || "unknown").slice(0, 64);
}

export function normalizeLoginEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/** @param {import('express').Request} req */
export function getClientIp(req) {
  // Use Express-derived req.ip so spoofed X-Forwarded-For is ignored unless trust proxy is enabled.
  return normalizeIp(req.ip || req.socket?.remoteAddress || "unknown");
}

async function getAttemptRow(ip, email) {
  return queryOne("SELECT * FROM login_attempts WHERE ip = ? AND email = ?", [
    normalizeIp(ip),
    normalizeLoginEmail(email),
  ]);
}

export async function isLoginLocked(ip, email) {
  const row = await getAttemptRow(ip, email);
  if (!row?.locked_until) return false;
  if (new Date(row.locked_until) > new Date()) return true;
  await execute("DELETE FROM login_attempts WHERE ip = ? AND email = ?", [
    normalizeIp(ip),
    normalizeLoginEmail(email),
  ]);
  return false;
}

export async function getLockoutRemainingMs(ip, email) {
  const row = await getAttemptRow(ip, email);
  if (!row?.locked_until) return 0;
  return Math.max(0, new Date(row.locked_until).getTime() - Date.now());
}

export async function recordFailedLogin(ip, email) {
  const normalizedIp = normalizeIp(ip);
  const normalizedEmail = normalizeLoginEmail(email);

  await execute(
    `INSERT INTO login_attempts (ip, email, attempts, window_start, locked_until)
     VALUES (?, ?, 1, NOW(), NULL)
     ON DUPLICATE KEY UPDATE
       attempts = IF(
         TIMESTAMPDIFF(SECOND, window_start, NOW()) > ?,
         1,
         IF(attempts + 1 >= ?, 0, attempts + 1)
       ),
       window_start = IF(
         TIMESTAMPDIFF(SECOND, window_start, NOW()) > ?,
         NOW(),
         window_start
       ),
       locked_until = IF(
         TIMESTAMPDIFF(SECOND, window_start, NOW()) > ?,
         NULL,
         IF(attempts + 1 >= ?, DATE_ADD(NOW(), INTERVAL ? SECOND), locked_until)
       )`,
    [
      normalizedIp,
      normalizedEmail,
      WINDOW_SECONDS,
      MAX_ATTEMPTS,
      WINDOW_SECONDS,
      WINDOW_SECONDS,
      MAX_ATTEMPTS,
      LOCKOUT_SECONDS,
    ],
  );
}

export async function clearFailedLogins(ip, email) {
  await execute("DELETE FROM login_attempts WHERE ip = ? AND email = ?", [
    normalizeIp(ip),
    normalizeLoginEmail(email),
  ]);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(email, password) {
  const normalized = normalizeLoginEmail(email);
  if (!normalized || !password) {
    return { ok: false, message: "Email and password are required" };
  }
  if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
    return { ok: false, message: "Invalid email or password" };
  }
  if (String(password).length > 128) {
    return { ok: false, message: "Invalid email or password" };
  }
  return { ok: true, email: normalized };
}
