import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../db/query.js';
import { sendTemplateEmail } from './email/mailer.js';
import { isEmailConfigured } from './email/mailer.js';

export const MFA_CODE_TTL_MS = 10 * 60 * 1000;
export const MFA_MAX_VERIFY_ATTEMPTS = 5;
export const MFA_CHALLENGE_COOLDOWN_MS = 60 * 1000;
export const INVITE_EXPIRY_DAYS = 7;

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function maskEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const at = normalized.indexOf('@');
  if (at < 1) return '***';
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const maskedLocal =
    local.length <= 2 ? `${local[0] || '*'}***` : `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

export function userRequiresMfaEmail(row) {
  return Boolean(row?.mfa_email_enabled || row?.mfa_email_forced);
}

async function sendMfaCodeEmail(to, code) {
  return sendTemplateEmail({
    to,
    templateId: 'mfa_email_code',
    data: { code },
  });
}

/**
 * @param {string} userId
 * @param {'login' | 'enable'} purpose
 * @param {{ resend?: boolean }} [options]
 */
export async function createMfaEmailChallenge(userId, purpose = 'login', { resend = false } = {}) {
  const user = await queryOne(
    'SELECT id, email, is_active, mfa_email_enabled, mfa_email_forced FROM users WHERE id = ?',
    [userId]
  );
  if (!user || !user.is_active) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (purpose === 'login' && !userRequiresMfaEmail(user)) {
    const err = new Error('Email MFA is not enabled for this account');
    err.status = 400;
    throw err;
  }

  if (!isEmailConfigured()) {
    const err = new Error(
      'Email is not configured on this server. Contact an administrator to enable email MFA.'
    );
    err.status = 503;
    throw err;
  }

  const existing = await queryOne(
    `SELECT challenge_token, expires_at, created_at
     FROM mfa_email_challenges
     WHERE user_id = ? AND purpose = ? AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, purpose]
  );

  if (existing) {
    const ageMs = Date.now() - new Date(existing.created_at).getTime();
    if (ageMs < MFA_CHALLENGE_COOLDOWN_MS) {
      if (resend) {
        const err = new Error('Please wait before requesting a new code.');
        err.status = 429;
        throw err;
      }
      return {
        challengeToken: existing.challenge_token,
        emailHint: maskEmail(user.email),
        expiresInSeconds: Math.max(
          0,
          Math.floor((new Date(existing.expires_at).getTime() - Date.now()) / 1000)
        ),
      };
    }
  }

  await execute(
    'DELETE FROM mfa_email_challenges WHERE user_id = ? AND purpose = ?',
    [userId, purpose]
  );

  const code = generateCode();
  const challengeToken = uuidv4();
  const expiresAt = new Date(Date.now() + MFA_CODE_TTL_MS);

  await execute(
    `INSERT INTO mfa_email_challenges
      (id, user_id, challenge_token, purpose, code_hash, attempts, expires_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [
      uuidv4(),
      userId,
      challengeToken,
      purpose,
      bcrypt.hashSync(code, 10),
      expiresAt,
    ]
  );

  const emailResult = await sendMfaCodeEmail(user.email, code);
  if (!emailResult.sent) {
    await execute('DELETE FROM mfa_email_challenges WHERE challenge_token = ?', [challengeToken]);
    const err = new Error(
      'Could not send verification email. Ensure MAIL_ENABLED and SMTP settings are configured.'
    );
    err.status = 503;
    throw err;
  }

  return {
    challengeToken,
    emailHint: maskEmail(user.email),
    expiresInSeconds: Math.floor(MFA_CODE_TTL_MS / 1000),
  };
}

export async function verifyMfaEmailChallenge(challengeToken, code, { purpose } = {}) {
  const challenge = await queryOne(
    'SELECT * FROM mfa_email_challenges WHERE challenge_token = ?',
    [challengeToken]
  );

  if (!challenge) {
    const err = new Error('Invalid or expired verification code');
    err.status = 400;
    throw err;
  }

  if (purpose && challenge.purpose !== purpose) {
    const err = new Error('Invalid or expired verification code');
    err.status = 400;
    throw err;
  }

  if (new Date(challenge.expires_at) < new Date()) {
    await execute('DELETE FROM mfa_email_challenges WHERE id = ?', [challenge.id]);
    const err = new Error('Verification code expired. Request a new code.');
    err.status = 400;
    throw err;
  }

  if (challenge.attempts >= MFA_MAX_VERIFY_ATTEMPTS) {
    await execute('DELETE FROM mfa_email_challenges WHERE id = ?', [challenge.id]);
    const err = new Error('Too many failed attempts. Request a new code.');
    err.status = 429;
    throw err;
  }

  const match = bcrypt.compareSync(String(code || '').trim(), challenge.code_hash);
  if (!match) {
    await execute('UPDATE mfa_email_challenges SET attempts = attempts + 1 WHERE id = ?', [
      challenge.id,
    ]);
    const err = new Error('Invalid verification code');
    err.status = 400;
    throw err;
  }

  await execute('DELETE FROM mfa_email_challenges WHERE id = ?', [challenge.id]);

  const user = await queryOne('SELECT * FROM users WHERE id = ?', [challenge.user_id]);
  if (!user || !user.is_active) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return { user, purpose: challenge.purpose };
}
