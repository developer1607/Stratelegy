import { PERMISSION_KEYS, emptyPermissionFlags } from './permissionKeys.js';

export function pickPermissionFlags(record) {
  const out = emptyPermissionFlags();
  if (!record) return out;
  for (const key of PERMISSION_KEYS) {
    out[key] = Boolean(record[key]);
  }
  return out;
}

export function computeEffectivePermissions(record, rolesById) {
  if (!record) return emptyPermissionFlags();
  if (record.use_custom_permissions || !record.role_id) {
    return pickPermissionFlags(record);
  }
  const role = rolesById[record.role_id];
  if (role?.permissions) {
    const out = emptyPermissionFlags();
    for (const key of PERMISSION_KEYS) {
      out[key] = Boolean(role.permissions[key]);
    }
    return out;
  }
  return pickPermissionFlags(record);
}
