import { query, execute } from '../query.js';
import { PERMISSION_KEYS } from '../../constants/permissions.js';
import { LEGACY_PERMISSION_EXPAND } from '../../constants/permissionRegistry.js';

/** Expand legacy coarse flags on existing user_permissions rows. */
export async function migrateLegacyUserPermissionFlags() {
  const rows = await query('SELECT * FROM user_permissions');
  let updated = 0;

  for (const row of rows) {
    const patch = {};
    let changed = false;

    for (const [legacyKey, expandedKeys] of Object.entries(LEGACY_PERMISSION_EXPAND)) {
      if (!row[legacyKey]) continue;
      for (const key of expandedKeys) {
        if (PERMISSION_KEYS.includes(key) && !row[key]) {
          patch[key] = 1;
          changed = true;
        }
      }
    }

    if (!changed) continue;

    const setClause = Object.keys(patch)
      .map((k) => `\`${k}\` = 1`)
      .join(', ');
    await execute(`UPDATE user_permissions SET ${setClause} WHERE id = ?`, [row.id]);
    updated++;
  }

  if (updated > 0) {
    console.log(`[db] Expanded legacy permission flags for ${updated} user_permissions row(s)`);
  }
}
