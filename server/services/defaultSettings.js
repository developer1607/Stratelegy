import { queryOne } from '../db/query.js';
import { isEmailConfigured } from './email/mailer.js';

export async function getDefaultSettingsRow() {
  return queryOne('SELECT * FROM default_settings ORDER BY created_date ASC LIMIT 1');
}

/** MFA defaults applied when creating users or completing invite registration. */
export async function getNewUserMfaDefaults() {
  if (!isEmailConfigured()) {
    return { enabled: false, forced: false };
  }

  const row = await getDefaultSettingsRow();
  const enabled = Boolean(row?.default_mfa_email_enabled);
  return {
    enabled,
    forced: enabled && Boolean(row?.default_mfa_email_forced),
  };
}
