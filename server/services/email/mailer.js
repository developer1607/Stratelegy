import nodemailer from 'nodemailer';
import { config } from '../../config.js';
import { renderEmailTemplate } from './templates/index.js';

let transporter = null;

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
