import { query, execute } from './query.js';
import { PERMISSION_KEYS } from '../constants/permissions.js';
import { ENTITY_REGISTRY, SAAS_ENTITY_NAMES } from './entityDefinitions.js';
import { columnExists, addColumnIfMissing } from './schemaHelpers.js';
import { columnDefinitionSql } from './entitySchema.js';
import { isEmailConfigured } from '../services/email/mailer.js';

/** Legacy DBs: add columns introduced after initial CREATE TABLE. */
const USER_LEGACY_COLUMNS = {
  departments: 'VARCHAR(500) NULL',
  categories: 'VARCHAR(500) NULL',
  token_version: 'INT NOT NULL DEFAULT 0',
  mfa_email_enabled: 'TINYINT(1) NOT NULL DEFAULT 0',
  mfa_email_forced: 'TINYINT(1) NOT NULL DEFAULT 0',
  email_verified: 'TINYINT(1) NOT NULL DEFAULT 0',
};

async function backfillEmailVerified() {
  if (!(await columnExists('users', 'email_verified'))) return;

  await execute(`
    UPDATE users u
    SET email_verified = 1
    WHERE email_verified = 0
      AND EXISTS (
        SELECT 1 FROM invites i
        WHERE i.email = u.email AND i.accepted_at IS NOT NULL
      )
  `);

  await execute(`
    UPDATE users
    SET email_verified = 1
    WHERE email_verified = 0 AND role = 'admin'
  `);
}

/** When outbound mail is off, MFA cannot work — clear flags so users are not locked out. */
async function disableMfaWhenMailUnavailable() {
  if (isEmailConfigured()) return;

  const result = await execute(
    'UPDATE users SET mfa_email_enabled = 0, mfa_email_forced = 0 WHERE mfa_email_enabled = 1 OR mfa_email_forced = 1'
  );
  if (result.affectedRows > 0) {
    console.log(
      `[db] Mail disabled — cleared email MFA on ${result.affectedRows} user(s)`
    );
  }
}

async function syncUserColumns() {
  for (const [col, sqlType] of Object.entries(USER_LEGACY_COLUMNS)) {
    await addColumnIfMissing('users', col, `\`${col}\` ${sqlType}`);
  }
}

async function syncInviteColumns() {
  await addColumnIfMissing(
    'invites',
    'portal_role_id',
    '`portal_role_id` VARCHAR(36) NULL AFTER `role`'
  );
  await addColumnIfMissing(
    'invites',
    'expires_at',
    '`expires_at` DATETIME NULL AFTER `created_date`'
  );
}

async function syncUserPermissionRoleColumns() {
  await addColumnIfMissing(
    'user_permissions',
    'role_id',
    '`role_id` VARCHAR(36) NULL AFTER `user_name`'
  );
  await addColumnIfMissing(
    'user_permissions',
    'use_custom_permissions',
    '`use_custom_permissions` TINYINT(1) NOT NULL DEFAULT 0 AFTER `role_id`'
  );
  await addColumnIfMissing(
    'user_permissions',
    'pbx_domains',
    '`pbx_domains` TEXT NULL AFTER `use_custom_permissions`'
  );

  if (!(await columnExists('user_permissions', 'role_id'))) return;
  const indexes = await query(
    `SHOW INDEX FROM user_permissions WHERE Key_name = 'idx_user_permissions_role'`
  );
  if (indexes.length === 0) {
    await execute(`ALTER TABLE user_permissions ADD INDEX idx_user_permissions_role (role_id)`);
  }
}

async function syncEntityColumns() {
  for (const entityName of SAAS_ENTITY_NAMES) {
    const def = ENTITY_REGISTRY[entityName];
    for (const [col, spec] of Object.entries(def.columns)) {
      if (col === 'id') continue;
      await addColumnIfMissing(def.table, col, columnDefinitionSql(col, spec));
    }
  }
}

async function syncPermissionColumns() {
  for (const key of PERMISSION_KEYS) {
    if (await columnExists('user_permissions', key)) continue;
    await execute(
      `ALTER TABLE user_permissions ADD COLUMN \`${key}\` TINYINT(1) NOT NULL DEFAULT 0`
    );
    console.log(`[db] Added user_permissions.${key}`);
  }
}

/** Align live MySQL columns with entityDefinitions + permission registry. */
export async function syncSchema() {
  await syncUserColumns();
  await backfillEmailVerified();
  await syncInviteColumns();
  await syncUserPermissionRoleColumns();
  await syncEntityColumns();
  await syncPermissionColumns();
  await disableMfaWhenMailUnavailable();
}
