import nodemailer from 'nodemailer';
import { config } from '../../config.js';
import { renderEmailTemplate } from './templates/index.js';

let transporter = null;

/** Cached SMTP verify result — avoids hammering the server on every Settings page load. */
let verifyCache = { at: 0, ok: null, error: null };
const VERIFY_CACHE_MS = 120_000;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.mail.host) return null;

  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    requireTLS: !config.mail.secure && config.mail.port === 587,
    auth: config.mail.user
      ? {
          user: config.mail.user,
          pass: config.mail.pass,
        }
      : undefined,
  });

  return transporter;
}

/** Clear cached transporter after .env credential changes (dev hot-reload). */
export function resetMailTransporter() {
  transporter = null;
  verifyCache = { at: 0, ok: null, error: null };
}

/** Which SMTP-related env vars are missing (never exposes secret values). */
export function getMailEnvStatus() {
  const missing = [];
  if (config.mail.enabled !== true) missing.push('MAIL_ENABLED');
  if (!config.mail.host) missing.push('SMTP_HOST');
  if (!config.mail.from) missing.push('SMTP_FROM');
  if (!config.mail.user) missing.push('SMTP_USER');
  if (!config.mail.pass) missing.push('SMTP_PASS');

  return {
    mail_enabled_flag: config.mail.enabled === true,
    env_complete: missing.length === 0,
    missing,
    smtp_host: config.mail.host || null,
    from_address: config.mail.from || null,
    smtp_user_set: Boolean(config.mail.user),
    smtp_pass_set: Boolean(config.mail.pass),
  };
}

/** True when required SMTP env vars are present (does not test the connection). */
export function isEmailEnvConfigured() {
  return getMailEnvStatus().env_complete;
}

/** @deprecated Use isEmailEnvConfigured() or isEmailOperational() — kept for imports. */
export function isEmailConfigured() {
  return isEmailEnvConfigured();
}

function sanitizeSmtpError(err) {
  const msg = String(err?.message || err || 'SMTP connection failed');
  if (/invalid login|authentication|credentials|535|534|auth/i.test(msg)) {
    return 'SMTP authentication failed — check SMTP_USER and SMTP_PASS in server environment variables.';
  }
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|ESOCKET/i.test(msg)) {
    return `Cannot reach SMTP server (${config.mail.host}) — check SMTP_HOST and SMTP_PORT.`;
  }
  if (/self signed|certificate|TLS|SSL/i.test(msg)) {
    return 'SMTP TLS/SSL error — verify SMTP_SECURE and SMTP_PORT match your provider.';
  }
  return msg.length > 220 ? `${msg.slice(0, 217)}…` : msg;
}

/** Test SMTP login/connectivity. Result is cached briefly. */
export async function verifySmtpConnection({ force = false } = {}) {
  const env = getMailEnvStatus();
  if (!env.env_complete) {
    return {
      ok: false,
      error: env.missing.length
        ? `Missing: ${env.missing.join(', ')}`
        : 'SMTP is not configured',
      missing: env.missing,
    };
  }

  const now = Date.now();
  if (!force && verifyCache.ok !== null && now - verifyCache.at < VERIFY_CACHE_MS) {
    return { ok: verifyCache.ok, error: verifyCache.error, cached: true };
  }

  const transport = getTransporter();
  if (!transport) {
    return { ok: false, error: 'Could not create SMTP transport' };
  }

  try {
    await transport.verify();
    verifyCache = { at: now, ok: true, error: null };
    return { ok: true, error: null, cached: false };
  } catch (err) {
    const error = sanitizeSmtpError(err);
    verifyCache = { at: now, ok: false, error };
    console.warn('[email] SMTP verify failed:', error);
    return { ok: false, error, cached: false };
  }
}

/** True when SMTP env is complete and the server can authenticate (cached verify). */
export async function isEmailOperational() {
  const env = getMailEnvStatus();
  if (!env.env_complete) return false;
  const { ok } = await verifySmtpConnection();
  return ok;
}

/**
 * Status for Settings UI and admin diagnostics.
 * @param {{ verify?: boolean, force?: boolean }} [options]
 */
export async function getEmailOperationalStatus({ verify = true, force = false } = {}) {
  const env = getMailEnvStatus();
  const base = {
    ...env,
    app_name: config.appName,
    app_base_url: config.appBaseUrl,
    connection_ok: null,
    connection_error: null,
    connection_checked_at: null,
  };

  if (!env.mail_enabled_flag) {
    return {
      ...base,
      status: 'disabled',
      mail_enabled: false,
      env_configured: false,
    };
  }

  if (!env.env_complete) {
    return {
      ...base,
      status: 'incomplete',
      mail_enabled: false,
      env_configured: false,
      connection_error: `Missing: ${env.missing.join(', ')}`,
    };
  }

  if (!verify) {
    return {
      ...base,
      status: 'unverified',
      mail_enabled: false,
      env_configured: true,
    };
  }

  const result = await verifySmtpConnection({ force });
  return {
    ...base,
    status: result.ok ? 'ready' : 'failed',
    mail_enabled: result.ok,
    env_configured: true,
    connection_ok: result.ok,
    connection_error: result.error,
    connection_checked_at: new Date().toISOString(),
    connection_cached: Boolean(result.cached),
  };
}

export async function sendRenderedEmail({ to, subject, text, html, replyTo, logLabel = 'email' }) {
  if (!to) {
    const err = new Error('Recipient email is required');
    err.status = 400;
    throw err;
  }

  if (!isEmailEnvConfigured()) {
    const err = new Error(
      'Email is not configured. Set MAIL_ENABLED=true and SMTP settings on the server.'
    );
    err.status = 503;
    throw err;
  }

  const transport = getTransporter();
  if (!transport) {
    const err = new Error('SMTP is not configured on this server');
    err.status = 503;
    throw err;
  }

  const info = await transport.sendMail({
    from: config.mail.from,
    to,
    replyTo: replyTo || config.mail.replyTo || undefined,
    subject,
    text,
    html,
  });

  console.log(`[email] sent ${logLabel} → ${to} (${info.messageId || 'ok'})`);
  return { sent: true, messageId: info.messageId, subject, to };
}

export async function sendTemplateEmail({ to, templateId, data, replyTo }) {
  if (!to) return { sent: false, skipped: true, reason: 'missing_recipient' };

  const { subject, text, html } = await renderEmailTemplate(templateId, data);

  if (!isEmailEnvConfigured()) {
    console.log(`[email] (disabled) ${templateId} → ${to}`);
    console.log(`[email] subject: ${subject}`);
    if (text) console.log(`[email] text:\n${text}`);
    return { sent: false, skipped: true, reason: 'mail_disabled', subject, preview: text };
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn('[email] SMTP host missing; email not sent');
    return { sent: false, skipped: true, reason: 'smtp_not_configured' };
  }

  const info = await transport.sendMail({
    from: config.mail.from,
    to,
    replyTo: replyTo || config.mail.replyTo || undefined,
    subject,
    text,
    html,
  });

  console.log(`[email] sent ${templateId} → ${to} (${info.messageId || 'ok'})`);
  return { sent: true, messageId: info.messageId, subject };
}
