import { config } from '../config.js';

/** Patterns that must never be returned to API clients. */
const INTERNAL_LEAK_PATTERNS = [
  /\bsql\b/i,
  /\bmysql\b/i,
  /duplicate entry/i,
  /unknown column/i,
  /doesn't exist/i,
  /syntax error/i,
  /ER_[A-Z0-9_]+/,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
];

export function isDatabaseError(err) {
  if (!err) return false;
  if (err.code && String(err.code).startsWith('ER_')) return true;
  if (err.sqlState || err.sqlMessage) return true;
  if (typeof err.message === 'string' && INTERNAL_LEAK_PATTERNS.some((re) => re.test(err.message))) {
    return /\bsql\b|\bmysql\b|ER_/i.test(err.message);
  }
  return false;
}

export function looksLikeInternalLeak(message) {
  if (!message || typeof message !== 'string') return false;
  return INTERNAL_LEAK_PATTERNS.some((re) => re.test(message));
}

/**
 * Build a safe HTTP error payload. Never exposes SQL, stack traces, or upstream internals in production.
 * @param {Error & { status?: number, statusCode?: number, extra_data?: object, expose?: boolean }} err
 */
export function formatHttpError(err) {
  const status = Number(err?.status || err?.statusCode) || 500;
  const isClientError = status >= 400 && status < 500;

  if (isDatabaseError(err)) {
    return { status: 500, message: 'Internal server error' };
  }

  if (isClientError && err.message && !looksLikeInternalLeak(err.message)) {
    return {
      status,
      message: err.message,
      ...(err.extra_data ? { extra_data: err.extra_data } : {}),
    };
  }

  if (err?.expose === true && err.message && !looksLikeInternalLeak(err.message)) {
    return {
      status,
      message: err.message,
      ...(err.extra_data ? { extra_data: err.extra_data } : {}),
    };
  }

  if (!config.isProduction && err?.message && !looksLikeInternalLeak(err.message)) {
    return {
      status,
      message: err.message,
      ...(err.extra_data ? { extra_data: err.extra_data } : {}),
    };
  }

  if (isClientError) {
    return { status, message: 'Request could not be completed' };
  }

  return { status: 500, message: 'Internal server error' };
}

/** @param {number} status @param {string} message @param {object} [extra] */
export function createHttpError(status, message, extra = {}) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  if (extra.extra_data) err.extra_data = extra.extra_data;
  return err;
}
