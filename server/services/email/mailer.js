import nodemailer from 'nodemailer';
import { config } from '../../config.js';
import { renderEmailTemplate } from './templates/index.js';

let transporter = null;

function isGmailHost() {
  return (config.mail.host || '').toLowerCase().includes('gmail.com');
}

function formatSmtpError(err) {
  const raw = err?.message || String(err);
  const code = err?.code || err?.responseCode;

  if (code === 535 || /535|BadCredentials|Username and Password not accepted/i.test(raw)) {
    const hints = isGmailHost()
      ? [
          'Gmail/Google Workspace does not accept your normal account password for SMTP.',
          'Create an App Password: Google Account → Security → 2-Step Verification → App passwords.',
          'Use the 16-character App Password as SMTP_PASS in .env (no spaces).',
          'SMTP_USER must exactly match the Google mailbox (insight@stratelegy.com).',
          'Workspace admins: ensure SMTP is allowed for this user in Admin console.',
        ]
      : [
          'SMTP username or password was rejected by the mail server.',
          'Confirm SMTP_USER and SMTP_PASS in .env, then restart the server.',
        ];

    return {
      ok: false,
      message: 'SMTP login failed — username or password not accepted',
      detail: raw,
      hints,
      provider: isGmailHost() ? 'gmail' : 'smtp',
    };
  }

  return {
    ok: false,
    message: raw,
    detail: raw,
    hints: ['Check SMTP_HOST, SMTP_PORT, and credentials in .env, then restart the server.'],
  };
}

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
}

export function isEmailConfigured() {
  return Boolean(config.mail.enabled && config.mail.host && config.mail.from);
}

export function getMailConfigStatus() {
  return {
    enabled: config.mail.enabled,
    configured: isEmailConfigured(),
    host: config.mail.host || null,
    port: config.mail.port,
    secure: config.mail.secure,
    user: config.mail.user || null,
    from: config.mail.from || null,
    replyTo: config.mail.replyTo || null,
    appName: config.appName,
    supportEmail: config.supportEmail || null,
  };
}

export async function sendTestEmail({ to, sentBy }) {
  const subject = `${config.appName} — SMTP test`;
  const sentAt = new Date().toISOString();
  const text = [
    `This is a test email from ${config.appName}.`,
    '',
    `Sent at: ${sentAt}`,
    sentBy ? `Triggered by: ${sentBy}` : '',
    '',
    'If you received this message, outbound SMTP is working correctly.',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 16px;color:#0D1B2E;">${config.appName}</h2>
      <p style="margin:0 0 12px;">This is a <strong>test email</strong>. Outbound SMTP appears to be working.</p>
      <p style="margin:0 0 8px;color:#666;font-size:14px;">Sent at: ${sentAt}</p>
      ${sentBy ? `<p style="margin:0;color:#666;font-size:14px;">Triggered by: ${sentBy}</p>` : ''}
    </div>
  `;

  if (!isEmailConfigured()) {
    return {
      sent: false,
      skipped: true,
      reason: 'mail_disabled',
      subject,
      preview: text,
      message:
        'MAIL_ENABLED is false or SMTP is not fully configured — email logged to server console only',
    };
  }

  const transport = getTransporter();
  if (!transport) {
    return {
      sent: false,
      skipped: true,
      reason: 'smtp_not_configured',
      message: 'SMTP host is missing',
    };
  }

  try {
    const info = await transport.sendMail({
      from: config.mail.from,
      to,
      replyTo: config.mail.replyTo || undefined,
      subject,
      text,
      html,
    });

    console.log(`[email] test → ${to} (${info.messageId || 'ok'})`);
    return {
      sent: true,
      messageId: info.messageId,
      subject,
      message: `Test email sent to ${to}`,
    };
  } catch (err) {
    const formatted = formatSmtpError(err);
    return {
      sent: false,
      message: formatted.message,
      detail: formatted.detail,
      hints: formatted.hints,
      provider: formatted.provider,
    };
  }
}

export async function sendTemplateEmail({ to, templateId, data, replyTo }) {
  if (!to) return { sent: false, skipped: true, reason: 'missing_recipient' };

  const { subject, text, html } = renderEmailTemplate(templateId, data);

  if (!isEmailConfigured()) {
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

export async function verifySmtpConnection() {
  if (!isEmailConfigured()) {
    return { ok: false, message: 'Mail disabled or SMTP not configured' };
  }
  const transport = getTransporter();
  try {
    await transport.verify();
    return { ok: true, message: 'SMTP connection verified' };
  } catch (err) {
    return formatSmtpError(err);
  }
}
